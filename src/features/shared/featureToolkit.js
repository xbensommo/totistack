/**
 * @file src/features/shared/featureToolkit.js
 * @description Shared, boring helpers for apps/features that use direct root-store shard actions.
 *
 * Rule:
 *   store.<collectionName>Actions.fetchInitialPage(...)
 *   store.<collectionName>Actions.getById(id)
 *   store.<collectionName>Actions.add(payload)
 *   store.<collectionName>Actions.update(id, patch)
 *   store.<collectionName>Actions.remove(id)
 */

export class FeatureError extends Error {
  constructor(message = 'The requested action could not be completed.', code = 'FEATURE_ERROR', details = null) {
    super(message)
    this.name = 'FeatureError'
    this.code = code
    this.details = details
  }
}

export class FeatureValidationError extends FeatureError {
  constructor(message = 'Some required information is missing or invalid.', details = null) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'FeatureValidationError'
  }
}

export class FeatureAuthorizationError extends FeatureError {
  constructor(message = 'You are not allowed to perform this action.', details = null) {
    super(message, 'FORBIDDEN', details)
    this.name = 'FeatureAuthorizationError'
  }
}

export function normalizeError(error, fallbackMessage = 'The requested action failed.') {
  if (error instanceof FeatureError) return error

  const message = error?.message || fallbackMessage
  const normalized = new FeatureError(message, error?.code || 'FEATURE_ERROR', error?.details || null)
  normalized.cause = error
  return normalized
}

export function createId(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now().toString(36)}_${random}`
}

export function slugify(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function hasPermission(access, permission) {
  if (!permission) return true

  const roles = Array.isArray(access?.roles) ? access.roles : []
  const permissions = Array.isArray(access?.permissions) ? access.permissions : []

  return permissions.includes(permission) || roles.includes('admin') || roles.includes('sysadmin')
}

export function assertAccess(access, permission, message = 'You are not allowed to perform this action.') {
  if (!hasPermission(access, permission)) {
    throw new FeatureAuthorizationError(message, { permission })
  }
}

export function requireCollectionActions(store, collectionName) {
  const actionKey = `${collectionName}Actions`
  const actions = store?.[actionKey]

  if (!actions || typeof actions !== 'object') {
    throw new FeatureError(`Missing root-store action object: store.${actionKey}`, 'MISSING_COLLECTION_ACTIONS', {
      collectionName,
      actionKey,
    })
  }

  return actions
}

export function requireActionMethod(actions, methodName, actionKey = 'collectionActions') {
  if (typeof actions?.[methodName] !== 'function') {
    throw new FeatureError(`Missing shard-provider action method: ${actionKey}.${methodName}`, 'UNSUPPORTED_ACTION', {
      actionKey,
      methodName,
    })
  }

  return actions[methodName].bind(actions)
}

/**
 * Backward-compatible export for older feature code.
 * New code should use direct store.<collectionName>Actions references.
 */
export const getCollectionActions = requireCollectionActions

export function getCollectionState(store, collectionName) {
  return store?.[collectionName] || null
}

export function getCollectionItems(store, collectionName) {
  const state = getCollectionState(store, collectionName)
  if (Array.isArray(state)) return state
  if (Array.isArray(state?.items)) return state.items
  if (Array.isArray(state?.value?.items)) return state.value.items
  if (Array.isArray(state?.value)) return state.value
  return []
}

export function normalizeFilters(filters = []) {
  if (Array.isArray(filters)) {
    return filters.filter((filter) => filter?.field && filter?.op && filter.value !== undefined)
  }

  return Object.entries(filters || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([field, value]) => ({ field, op: '==', value }))
}

export function normalizeFetchOptions(options = {}) {
  const normalized = {
    ...options,
    filters: normalizeFilters(options.filters),
    limit: options.limit ?? options.pageSize ?? 100,
  }

  delete normalized.pageSize

  if (!Array.isArray(normalized.orderBy)) {
    if (options.sort?.field) {
      normalized.orderBy = [{ field: options.sort.field, direction: options.sort.direction || 'desc' }]
    } else if (options.sortBy) {
      normalized.orderBy = [{ field: options.sortBy, direction: options.sortDirection || 'desc' }]
    }
  }

  delete normalized.sort
  delete normalized.sortBy
  delete normalized.sortDirection

  return normalized
}

export async function fetchDirectCollectionItems(store, collectionName, actions, options = {}) {
  const result = await actions.fetchInitialPage(normalizeFetchOptions(options))

  if (Array.isArray(result?.items)) return result.items
  if (Array.isArray(result)) return result
  return getCollectionItems(store, collectionName)
}

/**
 * Backward-compatible export for older feature code.
 * New code should call store.<collectionName>Actions.fetchInitialPage(...) directly.
 */
export async function fetchCollectionItems(store, collectionName, options = {}) {
  const actions = requireCollectionActions(store, collectionName)
  return fetchDirectCollectionItems(store, collectionName, actions, options)
}

/**
 * Backward-compatible export for older feature code.
 * New code should call the desired action directly.
 */
export async function runAction(actions, methodNames = [], ...args) {
  const methodName = Array.isArray(methodNames) ? methodNames[0] : methodNames
  return requireActionMethod(actions, methodName)(...args)
}

export async function confirmDecision(confirm, confirmation, context = {}) {
  if (typeof confirm !== 'function') return true
  const accepted = await confirm(confirmation, context)
  return accepted !== false
}

export function createLegacyService(service) {
  return service
}

export default {
  FeatureError,
  FeatureValidationError,
  FeatureAuthorizationError,
  normalizeError,
  createId,
  slugify,
  hasPermission,
  assertAccess,
  requireCollectionActions,
  requireActionMethod,
  getCollectionActions,
  getCollectionState,
  getCollectionItems,
  normalizeFilters,
  normalizeFetchOptions,
  fetchDirectCollectionItems,
  fetchCollectionItems,
  runAction,
  confirmDecision,
  createLegacyService,
}
