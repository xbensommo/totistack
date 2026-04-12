/**
 * @file src/features/database-manager/use-database-manager.js
 * @description Firestore database-manager composable with optional store/service integration.
 */

import { computed, inject, ref } from 'vue'
import { getAuth } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore'

/**
 * Resolve a user-friendly error message function.
 *
 * @returns {(error: unknown) => string}
 */
function resolveGetFriendlyMessage() {
  try {
    const mod = window?.__SHARD_PROVIDER__
    if (mod && typeof mod.getFriendlyMessage === 'function') {
      return mod.getFriendlyMessage
    }
  } catch {
    // Ignore runtime-global lookup issues.
  }

  return (error) => {
    if (typeof error === 'string') return error
    if (error && typeof error === 'object' && 'message' in error) {
      return error.message || 'An unexpected error occurred.'
    }
    return 'An unexpected error occurred.'
  }
}

const getFriendlyMessage = resolveGetFriendlyMessage()

/**
 * Create a minimal local store facade when no injected store exists.
 *
 * @returns {{isLoading: boolean, seedCollection: null, inspectDoc: null}}
 */
function createFallbackStore() {
  return {
    isLoading: false,
    seedCollection: null,
    inspectDoc: null,
  }
}

/**
 * Seed documents into a collection using Firestore batch writes.
 *
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} collectionPath
 * @param {Array<Record<string, unknown>>} documents
 * @param {{ merge?: boolean }} [options={}]
 * @returns {Promise<{ collection: string, inserted: number, merge: boolean }>}
 */
async function seedWithFirestore(db, collectionPath, documents, options = {}) {
  if (!collectionPath) throw new Error('collectionPath is required')
  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error('documents must be a non-empty array')
  }

  const merge = Boolean(options.merge)
  const batchSize = 400

  for (let index = 0; index < documents.length; index += batchSize) {
    const batch = writeBatch(db)
    const chunk = documents.slice(index, index + batchSize)

    for (const entry of chunk) {
      const data = entry && typeof entry === 'object' ? { ...entry } : {}
      const explicitId = data._id || data.id || null
      delete data._id
      delete data.id

      const ref = explicitId
        ? doc(db, collectionPath, explicitId)
        : doc(collection(db, collectionPath))

      batch.set(ref, data, { merge })
    }

    await batch.commit()
  }

  return {
    collection: collectionPath,
    inserted: documents.length,
    merge,
  }
}

/**
 * @returns {{
 *   loading: import('vue').Ref<boolean>,
 *   error: import('vue').Ref<string|null>,
 *   collections: import('vue').Ref<string[]>,
 *   schemaFields: import('vue').Ref<Record<string, {types: string[], count: number}>>,
 *   currentUser: import('vue').ComputedRef<import('firebase/auth').User|null>,
 *   isLoading: import('vue').ComputedRef<boolean>,
 *   listCollections: (paths?: string[]) => Promise<void>,
 *   browseCollection: (collectionPath: string, pageSize?: number) => Promise<Array<Record<string, unknown>>>,
 *   viewSchema: (collectionPath: string) => Promise<void>,
 *   seedCollection: (collectionPath: string, payload: Array<Record<string, unknown>>, options?: { merge?: boolean }) => Promise<unknown>,
 *   inspectDoc: (docPath: string) => Promise<Record<string, unknown>|null>,
 *   backupCollection: (source: string, dest?: string) => Promise<unknown>,
 *   runMigration: (src: string, dest: string, fn: Function) => Promise<unknown>
 * }}
 */
export function useDatabaseManager() {
  const service = inject('databaseManagerService', null)
  const injectedStore = inject('databaseManagerStore', null) || createFallbackStore()

  const loading = ref(false)
  const error = ref(null)
  const collections = ref([])
  const schemaFields = ref({})

  const auth = getAuth()
  const db = getFirestore()

  const currentUser = computed(() => auth.currentUser)
  const isLoading = computed(() => loading.value || Boolean(injectedStore?.isLoading))

  /**
   * @param {unknown} err
   */
  function setError(err) {
    error.value = getFriendlyMessage(err)
  }

  /**
   * @template T
   * @param {() => Promise<T>} fn
   * @returns {Promise<T>}
   */
  async function run(fn) {
    loading.value = true
    error.value = null

    try {
      return await fn()
    } catch (err) {
      setError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Populate the collection list from explicit paths or the feature manifest.
   *
   * @param {string[]} [paths]
   * @returns {Promise<void>}
   */
  async function listCollections(paths) {
    await run(async () => {
      if (Array.isArray(paths) && paths.length > 0) {
        collections.value = [...paths]
        return
      }

      const { default: manifest } = await import('./feature.manifest.js')
      collections.value = Array.isArray(manifest?.collections) ? [...manifest.collections] : []
    })
  }

  /**
   * Fetch a page of documents from a collection.
   *
   * @param {string} collectionPath
   * @param {number} [pageSize=25]
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async function browseCollection(collectionPath, pageSize = 25) {
    return run(async () => {
      if (!collectionPath) throw new Error('collectionPath is required')

      const snap = await getDocs(
        query(collection(db, collectionPath), orderBy('__name__'), limit(pageSize)),
      )

      return snap.docs.map((entry) => ({ _id: entry.id, ...entry.data() }))
    })
  }

  /**
   * Infer and cache a collection schema.
   *
   * @param {string} collectionPath
   * @returns {Promise<void>}
   */
  async function viewSchema(collectionPath) {
    await run(async () => {
      if (!collectionPath) throw new Error('collectionPath is required')

      if (service && typeof service.inferSchema === 'function') {
        schemaFields.value = await service.inferSchema(collectionPath)
        return
      }

      const docs = await browseCollection(collectionPath, 50)
      const schema = {}

      for (const row of docs) {
        for (const [key, value] of Object.entries(row)) {
          const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
          if (!schema[key]) {
            schema[key] = { types: new Set(), count: 0 }
          }
          schema[key].types.add(type)
          schema[key].count += 1
        }
      }

      schemaFields.value = Object.fromEntries(
        Object.entries(schema).map(([key, value]) => [
          key,
          { types: [...value.types], count: value.count },
        ]),
      )
    })
  }

  /**
   * Seed a collection through the injected store when available, otherwise
   * use Firestore batch writes directly.
   *
   * @param {string} collectionPath
   * @param {Array<Record<string, unknown>>} payload
   * @param {{ merge?: boolean }} [options={}]
   * @returns {Promise<unknown>}
   */
  async function seedCollection(collectionPath, payload, options = {}) {
    if (typeof injectedStore?.seedCollection === 'function') {
      return injectedStore.seedCollection(collectionPath, payload, options)
    }

    return run(() => seedWithFirestore(db, collectionPath, payload, options))
  }

  /**
   * Inspect a single document.
   *
   * @param {string} docPath
   * @returns {Promise<Record<string, unknown>|null>}
   */
  async function inspectDoc(docPath) {
    if (typeof injectedStore?.inspectDoc === 'function') {
      return injectedStore.inspectDoc(docPath)
    }

    return run(async () => {
      if (!docPath) throw new Error('docPath is required')

      const snap = await getDoc(doc(db, docPath))
      if (!snap.exists()) {
        return null
      }

      return {
        _id: snap.id,
        ...snap.data(),
      }
    })
  }

  /**
   * @param {string} source
   * @param {string} [dest]
   * @returns {Promise<unknown>}
   */
  async function backupCollection(source, dest) {
    return run(async () => {
      if (!service || typeof service.backupCollection !== 'function') {
        throw new Error('databaseManagerService.backupCollection is not available')
      }

      return service.backupCollection(source, dest)
    })
  }

  /**
   * @param {string} src
   * @param {string} dest
   * @param {Function} transformFn
   * @returns {Promise<unknown>}
   */
  async function runMigration(src, dest, transformFn) {
    return run(async () => {
      if (!service || typeof service.runMigration !== 'function') {
        throw new Error('databaseManagerService.runMigration is not available')
      }

      return service.runMigration(src, dest, transformFn)
    })
  }

  return {
    loading,
    error,
    collections,
    schemaFields,
    currentUser,
    isLoading,
    listCollections,
    browseCollection,
    viewSchema,
    seedCollection,
    inspectDoc,
    backupCollection,
    runMigration,
  }
}

export default useDatabaseManager
