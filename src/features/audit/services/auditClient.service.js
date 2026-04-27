/**
 * @file src/features/audit/services/auditClient.service.js
 * @description Read-only audit client. Writes should come from trusted server code.
 */

const DEFAULT_LIMIT = 50

function cleanLimit(limit) {
  const parsed = Number(limit || DEFAULT_LIMIT)
  return Number.isFinite(parsed) ? Math.max(1, Math.min(parsed, 250)) : DEFAULT_LIMIT
}

export function createAuditClient({ store } = {}) {
  if (!store) throw new Error('createAuditClient requires the root store.')
  if (!store.auditLogsActions) throw new Error('Root store is missing auditLogsActions.')

  return {
    fetchForEntity(entityType, entityId, limit = DEFAULT_LIMIT) {
      return store.auditLogsActions.fetchInitialPage({
        limit: cleanLimit(limit),
        filters: [
          { field: 'entityType', op: '==', value: entityType },
          { field: 'entityId', op: '==', value: entityId },
          { field: 'isDeleted', op: '==', value: false },
        ],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      })
    },

    fetchByActor(actorId, limit = DEFAULT_LIMIT) {
      return store.auditLogsActions.fetchInitialPage({
        limit: cleanLimit(limit),
        filters: [
          { field: 'actorId', op: '==', value: actorId },
          { field: 'isDeleted', op: '==', value: false },
        ],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      })
    },

    fetchByControl(controlId, limit = DEFAULT_LIMIT) {
      return store.auditLogsActions.fetchInitialPage({
        limit: cleanLimit(limit),
        filters: [
          { field: 'controlId', op: '==', value: controlId },
          { field: 'isDeleted', op: '==', value: false },
        ],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      })
    },

    fetchOpenReviews(limit = DEFAULT_LIMIT) {
      return store.auditLogsActions.fetchInitialPage({
        limit: cleanLimit(limit),
        filters: [
          { field: 'reviewStatus', op: '==', value: 'open' },
          { field: 'isDeleted', op: '==', value: false },
        ],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      })
    },
  }
}

export default createAuditClient
