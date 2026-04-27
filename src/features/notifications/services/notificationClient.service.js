/** @file src/features/notifications/services/notificationClient.service.js */

export function createNotificationClient({ store, userId } = {}) {
  if (!store) throw new Error('createNotificationClient requires the root store.')
  if (!store.notificationsActions) throw new Error('Root store is missing notificationsActions.')

  const actions = store.notificationsActions

  return {
    fetchUnread(limit = 20) {
      return actions.fetchInitialPage({
        limit,
        filters: [
          { field: 'recipientUserId', op: '==', value: userId },
          { field: 'status', op: '==', value: 'unread' },
          { field: 'isDeleted', op: '==', value: false },
        ],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      })
    },

    fetchInbox(limit = 30) {
      return actions.fetchInitialPage({
        limit,
        filters: [
          { field: 'recipientUserId', op: '==', value: userId },
          { field: 'isDeleted', op: '==', value: false },
        ],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
      })
    },

    markRead(id) {
      return actions.update(id, {
        status: 'read',
        readAt: new Date(),
        updatedAt: new Date(),
      })
    },

    archive(id) {
      return actions.update(id, {
        status: 'archived',
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
    },
  }
}

export default createNotificationClient
