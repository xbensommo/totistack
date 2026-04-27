/** @file functions/src/audit/writeAuditLog.js */

import { db, FieldValue } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'
import { sanitizeForLog } from '../core/sanitize.js'

export async function writeAuditLog({
  actor = null,
  actionId,
  operationId = null,
  entityType = null,
  entityId = null,
  source = 'server-action',
  status = 'success',
  severity = 'info',
  reason = null,
  before = null,
  after = null,
  changes = [],
  request = null,
  result = null,
  error = null,
  meta = {},
} = {}) {
  if (!actionId) throw new Error('writeAuditLog requires actionId.')

  const payload = {
    actorId: actor?.uid || null,
    actorEmail: actor?.email || null,
    actionId,
    operationId,
    entityType,
    entityId,
    source,
    status,
    severity,
    reason,
    before: sanitizeForLog(before),
    after: sanitizeForLog(after),
    changes: sanitizeForLog(changes),
    request: sanitizeForLog(request),
    result: sanitizeForLog(result),
    errorCode: error?.code || null,
    errorMessage: error?.message || null,
    meta: sanitizeForLog(meta),
    createdAt: FieldValue.serverTimestamp(),
    isDeleted: false,
  }

  await db.collection(COLLECTIONS.AUDIT_LOGS).add(payload)

  if (entityType && entityId) {
    await db.collection(COLLECTIONS.ENTITY_ACTIVITY).add({
      entityType,
      entityId,
      actionId,
      actorId: actor?.uid || null,
      actorName: actor?.name || actor?.email || 'System',
      summary: meta?.summary || actionId,
      severity,
      operationId,
      meta: sanitizeForLog(meta),
      createdAt: FieldValue.serverTimestamp(),
      isDeleted: false,
    })
  }
}
