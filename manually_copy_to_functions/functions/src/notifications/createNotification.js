/** @file functions/src/notifications/createNotification.js */

import { db, FieldValue } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'

export async function createNotification({
  recipientUserId = null,
  recipientUserIds = null,
  recipientRole = null,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  actionUrl = null,
  priority = 'normal',
  createdBy = 'system',
  delivery = { push: true },
  meta = {},
} = {}) {
  if (!recipientUserId && !Array.isArray(recipientUserIds) && !recipientRole) {
    throw new Error('Notification requires recipientUserId, recipientUserIds, or recipientRole.')
  }

  if (!type || !title || !message) {
    throw new Error('Notification requires type, title, and message.')
  }

  const payload = {
    recipientUserId,
    recipientUserIds: Array.isArray(recipientUserIds) ? recipientUserIds : [],
    recipientRole,
    type,
    title,
    message,
    entityType,
    entityId,
    actionUrl,
    priority,
    status: 'unread',
    delivery: {
      push: true,
      ...delivery,
    },
    meta,
    createdBy,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    readAt: null,
    archivedAt: null,
    isDeleted: false,
  }

  const ref = await db.collection(COLLECTIONS.NOTIFICATIONS).add(payload)
  return { id: ref.id, ...payload }
}
