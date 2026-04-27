/** @file src/features/audit/services/auditClient.service.js */

export function createAuditClient({ store } = {}) {
  if (!store) throw new Error('createAuditClient requires the root store.')
  if (!store.auditLogsActions) throw new Error('Root store is missing auditLogsActions.')

  return {
    fetchForEntity(entityType, entityId, limit = 50) {
      return store.auditLogsActions.fetchInitialPage({
        limit,
        filters: [
          { field: 'entityType', op: '==', value: entityType },
          { field: 'entityId', op: '==', value: entityId },
          { field: 'isDeleted', op: '==', value: false },
        ],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      })
    },
  }
}

export default createAuditClient
