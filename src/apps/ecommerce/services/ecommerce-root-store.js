/**
 * @file src/apps/ecommerce/services/ecommerce-root-store.js
 * @description Direct root-store bridge for ecommerce shard actions.
 */

import { EcommerceAppError } from '../utils/ecommerce.errors.js'

export function resolveCollectionActions(rootStore, collectionName) {
  return rootStore?.[`${collectionName}Actions`] || null
}

export function resolveCollectionState(rootStore, collectionName) {
  return rootStore?.[collectionName] || null
}

function readItems(state) {
  if (Array.isArray(state)) return state
  if (Array.isArray(state?.items)) return state.items
  if (Array.isArray(state?.value?.items)) return state.value.items
  if (Array.isArray(state?.value)) return state.value
  return []
}

export function getCollectionBridge(rootStore, collectionName) {
  const state = resolveCollectionState(rootStore, collectionName)
  const actions = resolveCollectionActions(rootStore, collectionName)

  return {
    name: collectionName,
    state,
    actions,
    items: readItems(state),
  }
}

export function requireCollectionBridge(rootStore, collectionName) {
  const bridge = getCollectionBridge(rootStore, collectionName)

  if (!bridge.actions) {
    throw new EcommerceAppError(`Missing root-store shard actions: store.${collectionName}Actions`, {
      code: 'ecommerce/root-store-actions-missing',
      meta: { collectionName },
    })
  }

  return bridge
}

export function createEcommerceRootStoreBridge(rootStore) {
  return {
    collection(collectionName) {
      return getCollectionBridge(rootStore, collectionName)
    },
  }
}
