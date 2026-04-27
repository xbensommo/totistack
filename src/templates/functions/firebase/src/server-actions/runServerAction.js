/** @file functions/src/server-actions/runServerAction.js */

import { db, FieldValue } from '../bootstrap/admin.js'
import { assertAuthenticated } from '../core/auth.js'
import { assertPermission } from '../core/permissions.js'
import { assertReasonWhenRequired, requireObject, requireString, validateRequiredFields } from '../core/validation.js'
import { toPlainError } from '../core/errors.js'
import { writeAuditLog } from '../audit/writeAuditLog.js'
import { createNotification } from '../notifications/createNotification.js'
import { completeActionRequest, failActionRequest, startActionRequest } from './idempotency.js'

function normalizeResult(value) {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object') return { value }
  return value
}

export async function runServerAction(request, registry = {}) {
  const auth = assertAuthenticated(request)
  const data = requireObject(request.data || {}, 'data')
  const actionId = requireString(data.actionId, 'actionId')
  const definition = registry[actionId]

  if (!definition) {
    throw new Error(`Unknown server action: ${actionId}`)
  }

  assertPermission(auth, definition.permission)
  assertReasonWhenRequired(data.reason, Boolean(definition.requiresReason))

  const input = data.input || {}
  validateRequiredFields(input, definition.input?.required || [])

  let actionRequestRef = null
  let operationId = data.operationId || null

  try {
    if (definition.idempotency !== false) {
      const started = await startActionRequest({
        operationId,
        actionId,
        actor: auth,
        entityType: data.entityType || definition.entityType || null,
        entityId: data.entityId || input.id || null,
        reason: data.reason || null,
        input,
      })

      actionRequestRef = started.ref
      if (started.existingResult) {
        return { ok: true, actionId, operationId, reused: true, data: started.existingResult }
      }
    }

    const ctx = {
      request,
      auth,
      actionId,
      operationId,
      input,
      reason: data.reason || null,
      entityType: data.entityType || definition.entityType || null,
      entityId: data.entityId || input.id || null,
      meta: data.meta || {},
      db,
      FieldValue,
      notify: (payload) => createNotification({
        ...payload,
        createdBy: auth.uid,
      }),
      audit: (payload) => writeAuditLog({
        actor: auth,
        actionId,
        operationId,
        entityType: data.entityType || definition.entityType || null,
        entityId: data.entityId || input.id || null,
        reason: data.reason || null,
        ...payload,
      }),
    }

    if (typeof definition.handler !== 'function') {
      throw new Error(`Server action ${actionId} is missing handler(ctx).`)
    }

    const handlerResult = normalizeResult(await definition.handler(ctx))
    const publicResult = normalizeResult(handlerResult.public || handlerResult)

    if (definition.audit !== false) {
      await writeAuditLog({
        actor: auth,
        actionId,
        operationId,
        entityType: ctx.entityType,
        entityId: ctx.entityId,
        source: 'server-action',
        status: 'success',
        severity: definition.severity || 'info',
        reason: data.reason || null,
        request: input,
        result: publicResult,
        meta: {
          summary: definition.label || actionId,
          ...data.meta,
        },
      })
    }

    await completeActionRequest(actionRequestRef, publicResult)

    return { ok: true, actionId, operationId, data: publicResult }
  } catch (error) {
    await failActionRequest(actionRequestRef, error)

    if (definition?.audit !== false) {
      await writeAuditLog({
        actor: auth,
        actionId,
        operationId,
        entityType: data.entityType || definition?.entityType || null,
        entityId: data.entityId || input.id || null,
        source: 'server-action',
        status: 'failure',
        severity: 'error',
        reason: data.reason || null,
        request: input,
        error: toPlainError(error),
      })
    }

    throw error
  }
}
