/** @file functions/src/notifications/deliveryLogs.js */

import { db, FieldValue } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'

export async function writeDeliveryLog({
  notificationId,
  recipientUserId = null,
  channel = 'push',
  provider = 'fcm',
  targetHash = null,
  status,
  attempts = 1,
  errorCode = null,
  errorMessage = null,
  providerMessageId = null,
  nextRetryAt = null,
} = {}) {
  await db.collection(COLLECTIONS.NOTIFICATION_DELIVERIES).add({
    notificationId,
    recipientUserId,
    channel,
    provider,
    targetHash,
    status,
    attempts,
    errorCode,
    errorMessage,
    providerMessageId,
    createdAt: FieldValue.serverTimestamp(),
    lastAttemptAt: FieldValue.serverTimestamp(),
    deliveredAt: status === 'delivered' ? FieldValue.serverTimestamp() : null,
    nextRetryAt,
    isDeleted: false,
  })
}
