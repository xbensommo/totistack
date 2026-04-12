/**
 * @file shared/featureToolkit.js
 * @description Shared runtime helpers for declarative Totistack feature modules.
 */

/**
 * Resolve collection actions from the root app store.
 *
 * @param {object} appStore
 * @param {string} collectionName
 * @returns {object}
 */
export function getCollectionActions(appStore, collectionName) {
  if (!appStore || !collectionName) {
    return {}
  }

  const directKey = `${collectionName}Actions`
  const direct = appStore[directKey]
  if (direct && typeof direct === 'object') {
    return direct
  }

  const generated = appStore.collectionsActions?.[collectionName]
  if (generated && typeof generated === 'object') {
    return generated
  }

  return {}
}

/**
 * Execute the first available action name from a list.
 *
 * @param {object} actions
 * @param {string[]} methodNames
 * @param {...any} args
 * @returns {Promise<any>}
 */
export async function runAction(actions, methodNames, ...args) {
  for (const methodName of methodNames) {
    if (typeof actions?.[methodName] === 'function') {
      return actions[methodName](...args)
    }
  }

  throw new Error(`Required collection action is missing. Expected one of: ${methodNames.join(', ')}`)
}

/**
 * Read collection items from the root store after a collection action updates state.
 *
 * @param {object} appStore
 * @param {string} collectionName
 * @returns {object[]}
 */
export function getCollectionItems(appStore, collectionName) {
  const stateSlice = appStore?.[collectionName]

  if (Array.isArray(stateSlice)) {
    return stateSlice
  }

  if (Array.isArray(stateSlice?.items)) {
    return stateSlice.items
  }

  if (Array.isArray(stateSlice?.value?.items)) {
    return stateSlice.value.items
  }

  if (Array.isArray(stateSlice?.value)) {
    return stateSlice.value
  }

  return []
}

/**
 * Fetch an initial page and return the normalized items list.
 *
 * @param {object} appStore
 * @param {string} collectionName
 * @param {object} options
 * @returns {Promise<object[]>}
 */
export async function fetchCollectionItems(appStore, collectionName, options = {}) {
  const actions = getCollectionActions(appStore, collectionName)
  if (typeof actions.fetchInitialPage === 'function') {
    await actions.fetchInitialPage(options)
  }
  return getCollectionItems(appStore, collectionName)
}

/**
 * Assert access when the root access layer is active.
 *
 * @param {object} access
 * @param {string|string[]} requirement
 * @param {string} fallbackMessage
 */
export function assertAccess(access, requirement, fallbackMessage = 'You are not allowed to perform this action.') {
  if (!requirement) return

  if (!access || access.enabled === false) {
    return
  }

  const allowed = typeof access.can === 'function'
    ? access.can(requirement)
    : true

  if (!allowed) {
    throw new Error(fallbackMessage)
  }
}

/**
 * Create a stable client-side identifier.
 *
 * @param {string} prefix
 * @returns {string}
 */
export function createId(prefix = 'item') {
  const safePrefix = String(prefix).trim() || 'item'
  if (globalThis.crypto?.randomUUID) {
    return `${safePrefix}_${globalThis.crypto.randomUUID()}`
  }
  return `${safePrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Return a trimmed string slug.
 *
 * @param {string} value
 * @returns {string}
 */
export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Create a proxy that lazily resolves a feature service.
 * Useful for backward compatibility with older direct default imports.
 *
 * @param {() => object} resolver
 * @returns {object}
 */
export function createLegacyService(resolver) {
  return new Proxy({}, {
    get(_target, property) {
      const service = resolver()
      const value = service?.[property]
      if (typeof value === 'function') {
        return value.bind(service)
      }
      return value
    },
  })
}

/**
 * Normalize a thrown value into a regular Error instance.
 *
 * @param {unknown} error
 * @param {string} fallbackMessage
 * @returns {Error}
 */
export function normalizeError(error, fallbackMessage = 'An unexpected feature error occurred.') {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  const message = error && typeof error === 'object' && 'message' in error
    ? error.message
    : fallbackMessage

  return new Error(String(message))
}
