/**
 * @file src/apps/ecommerce/services/ecommerce-core-actions.js
 * @description Shared direct shard-provider action helpers for ecommerce services.
 */

import { EcommerceAppError } from '../utils/ecommerce.errors.js'

export function requireEntityId(entity, entityName = 'record') {
  const id = entity?.id || entity?.docId || null
  if (!id) {
    throw new EcommerceAppError(`Cannot continue without a ${entityName} id.`, {
      code: 'ecommerce/entity-id-required',
      meta: { entityName },
    })
  }

  return id
}

export function requireAction(actions, methodName) {
  if (typeof actions?.[methodName] !== 'function') {
    throw new EcommerceAppError(`Missing shard action method: ${methodName}`, {
      code: 'ecommerce/collection-action-missing',
      meta: { methodName },
    })
  }

  return actions[methodName].bind(actions)
}

export async function commitCollectionUpdate(actions, id, payload) {
  return requireAction(actions, 'update')(id, payload)
}

export async function createCollectionRecord(actions, payload) {
  return requireAction(actions, 'add')(payload)
}
