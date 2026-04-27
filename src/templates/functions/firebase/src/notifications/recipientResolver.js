/** @file functions/src/notifications/recipientResolver.js */

import { db } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'

export function getNotificationRecipientIds(notification = {}) {
  const ids = new Set()
  if (notification.recipientUserId) ids.add(notification.recipientUserId)
  if (Array.isArray(notification.recipientUserIds)) {
    notification.recipientUserIds.filter(Boolean).forEach((id) => ids.add(id))
  }
  return [...ids]
}

export async function getActiveTokensForUsers(userIds = []) {
  if (!userIds.length) return []

  const chunks = []
  for (let i = 0; i < userIds.length; i += 10) {
    chunks.push(userIds.slice(i, i + 10))
  }

  const tokens = []
  for (const chunk of chunks) {
    const snap = await db.collection(COLLECTIONS.NOTIFICATION_TOKENS)
      .where('userId', 'in', chunk)
      .where('enabled', '==', true)
      .where('isDeleted', '==', false)
      .get()

    snap.docs.forEach((doc) => tokens.push({ id: doc.id, ...doc.data() }))
  }

  return tokens
}
