/** @file functions/src/server-actions/idempotency.js */

import { db, FieldValue } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'
import { fail } from '../core/errors.js'

export async function startActionRequest({ operationId, actionId, actor, entityType, entityId, reason, input } = {}) {
  if (!operationId) fail('invalid-argument', 'operationId is required for idempotent server actions.')

  const ref = db.collection(COLLECTIONS.ACTION_REQUESTS).doc(operationId)
  let existingResult = null

  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref)

    if (snap.exists) {
      const current = snap.data()
      if (current.status === 'completed') {
        existingResult = current.result || { ok: true, reused: true }
        return
      }

      if (current.status === 'running') {
        fail('already-exists', 'This operation is already running.', { operationId })
      }
    }

    transaction.set(ref, {
      actionId,
      operationId,
      actorId: actor.uid,
      actorEmail: actor.email,
      entityType: entityType || null,
      entityId: entityId || null,
      reason: reason || null,
      input: input || {},
      status: 'running',
      startedAt: FieldValue.serverTimestamp(),
      completedAt: null,
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      result: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isDeleted: false,
    }, { merge: true })
  })

  return { ref, existingResult }
}

export async function completeActionRequest(ref, result) {
  if (!ref) return
  await ref.update({
    status: 'completed',
    result: result || {},
    completedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function failActionRequest(ref, error) {
  if (!ref) return
  await ref.update({
    status: 'failed',
    errorCode: error?.code || error?.name || 'unknown',
    errorMessage: error?.message || 'Unknown error',
    failedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
}
