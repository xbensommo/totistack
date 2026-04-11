import { ref, computed, inject } from 'vue';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import { useDatabaseManagerStore } from '../stores/index.js';

/**
 * getFriendlyMessage shim – resolved from the shard-provider at runtime.
 * Falls back to the raw message so the app never silently swallows errors.
 */
function resolveGetFriendlyMessage() {
  try {
    // shard-provider exposes this as a named export
    const mod = window.__SHARD_PROVIDER__;
    if (mod && typeof mod.getFriendlyMessage === 'function') {
      return mod.getFriendlyMessage;
    }
  } catch (_) {
    // ignore
  }
  return (err) => (typeof err === 'string' ? err : err?.message ?? 'An unexpected error occurred.');
}

const getFriendlyMessage = resolveGetFriendlyMessage();

/**
 * useDatabaseManager
 *
 * Composable that surfaces Firebase-level operations and delegates
 * business logic to the Pinia store.
 *
 * @returns {{
 *   loading: import('vue').Ref<boolean>,
 *   error: import('vue').Ref<string|null>,
 *   collections: import('vue').Ref<string[]>,
 *   schemaFields: import('vue').Ref<Record<string, {types: string[], count: number}>>,
 *   currentUser: import('vue').ComputedRef<import('firebase/auth').User|null>,
 *   isLoading: import('vue').ComputedRef<boolean>,
 *   listCollections: (paths?: string[]) => Promise<void>,
 *   browseCollection: (collectionPath: string, pageSize?: number) => Promise<Array<Record<string,unknown>>>,
 *   viewSchema: (collectionPath: string) => Promise<void>,
 *   seedCollection: (...args: unknown[]) => Promise<unknown>,
 *   inspectDoc: (docPath: string) => Promise<unknown>,
 *   backupCollection: (source: string, dest?: string) => Promise<unknown>,
 *   runMigration: (src: string, dest: string, fn: Function) => Promise<unknown>
 * }}
 */
export function useDatabaseManager() {
  const store = useDatabaseManagerStore();
  const service = inject('databaseManagerService', null);

  const loading = ref(false);
  const error = ref(null);
  const collections = ref([]);
  const schemaFields = ref({});

  const auth = getAuth();
  const db = getFirestore();

  const currentUser = computed(() => auth.currentUser);
  const isLoading = computed(() => loading.value || store.isLoading);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function setError(err) {
    error.value = getFriendlyMessage(err);
  }

  async function run(fn) {
    loading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Populate `collections` ref from a known list or a Firestore root listing.
   * Firestore REST API is used because the JS SDK does not support listing
   * root collections client-side in all environments.
   *
   * @param {string[]} [paths] - explicit list; if omitted, reads from manifest
   */
  async function listCollections(paths) {
    await run(async () => {
      if (Array.isArray(paths) && paths.length) {
        collections.value = paths;
        return;
      }
      // Fallback: import manifest and use declared collections
      const { default: manifest } = await import('../manifest.js');
      collections.value = manifest.collections ?? [];
    });
  }

  /**
   * Fetch up to `pageSize` documents from a collection for inspection.
   * @param {string} collectionPath
   * @param {number} [pageSize=25]
   * @returns {Promise<Array<Record<string,unknown>>>}
   */
  async function browseCollection(collectionPath, pageSize = 25) {
    return run(async () => {
      if (!collectionPath) throw new Error('collectionPath is required');
      const q = query(collection(db, collectionPath), orderBy('__name__'), limit(pageSize));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
    });
  }

  /**
   * Infer and store schema for a collection via the service layer.
   * @param {string} collectionPath
   */
  async function viewSchema(collectionPath) {
    await run(async () => {
      if (!service) throw new Error('databaseManagerService not provided');
      schemaFields.value = await service.inferSchema(collectionPath);
    });
  }

  /**
   * Delegate to Pinia store – seed a collection.
   */
  async function seedCollection(...args) {
    return store.seedCollection(...args);
  }

  /**
   * Delegate to Pinia store – inspect a single document.
   * @param {string} docPath
   */
  async function inspectDoc(docPath) {
    return store.inspectDoc(docPath);
  }

  /**
   * Backup via service layer.
   * @param {string} source
   * @param {string} [dest]
   */
  async function backupCollection(source, dest) {
    return run(async () => {
      if (!service) throw new Error('databaseManagerService not provided');
      return service.backupCollection(source, dest);
    });
  }

  /**
   * Run a migration via service layer.
   * @param {string} src
   * @param {string} dest
   * @param {Function} transformFn
   */
  async function runMigration(src, dest, transformFn) {
    return run(async () => {
      if (!service) throw new Error('databaseManagerService not provided');
      return service.runMigration(src, dest, transformFn);
    });
  }

  return {
    // State
    loading,
    error,
    collections,
    schemaFields,
    // Computed
    currentUser,
    isLoading,
    // Actions
    listCollections,
    browseCollection,
    viewSchema,
    seedCollection,
    inspectDoc,
    backupCollection,
    runMigration
  };
}

export default useDatabaseManager;
