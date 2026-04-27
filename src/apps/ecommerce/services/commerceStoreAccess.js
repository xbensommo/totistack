/** @file src/apps/ecommerce/services/commerceStoreAccess.js */
export function getCollectionItems(store, collectionName) {
  const source = store?.[collectionName]
  if (Array.isArray(source)) return source
  if (Array.isArray(source?.items)) return source.items
  if (Array.isArray(source?.value)) return source.value
  if (Array.isArray(source?.value?.items)) return source.value.items
  return []
}

export function requireActions(store, collectionName) {
  const key = `${collectionName}Actions`
  const actions = store?.[key]
  if (!actions) throw new Error(`[ecommerce] Missing root store actions: store.${key}`)
  return actions
}

export async function fetchPage(store, collectionName, options = {}) {
  const actions = requireActions(store, collectionName)
  if (typeof actions.fetchInitialPage !== 'function') {
    throw new Error(`[ecommerce] store.${collectionName}Actions.fetchInitialPage is required.`)
  }
  return actions.fetchInitialPage(options)
}

export function normalizeMoney(value, currency = 'NAD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value || 0))
}

export function normalizeDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
