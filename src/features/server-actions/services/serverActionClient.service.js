/** @file src/features/server-actions/services/serverActionClient.service.js */

import { httpsCallable } from 'firebase/functions'

function createOperationId(actionId, entityType, entityId) {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${actionId}:${entityType || 'entity'}:${entityId || 'new'}:${random}`
}

export function createServerActionClient({ functions, callableName = 'serverActionRun' } = {}) {
  if (!functions) {
    throw new Error('createServerActionClient requires a Firebase Functions instance.')
  }

  const callServerAction = httpsCallable(functions, callableName)

  return {
    async run({ actionId, entityType, entityId, reason = null, input = {}, operationId = null, meta = {} } = {}) {
      if (!actionId) throw new Error('Server action requires actionId.')

      const response = await callServerAction({
        actionId,
        entityType,
        entityId,
        reason,
        input,
        operationId: operationId || createOperationId(actionId, entityType, entityId),
        meta,
      })

      return response.data
    },
  }
}

export default createServerActionClient
