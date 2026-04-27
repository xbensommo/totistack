/** @file functions/src/notifications/onNotificationCreated.js */

import { db, FieldValue, messaging } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'
import { sha256 } from '../core/hash.js'
import { writeAuditLog } from '../audit/writeAuditLog.js'
import { getActiveTokensForUsers, getNotificationRecipientIds } from './recipientResolver.js'
import { writeDeliveryLog } from './deliveryLogs.js'

const INVALID_TOKEN_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
])

function toFcmData(notificationId, notification = {}) {
  return {
    notificationId: String(notificationId),
    type: String(notification.type || ''),
    entityType: String(notification.entityType || ''),
    entityId: String(notification.entityId || ''),
    actionUrl: String(notification.actionUrl || ''),
    priority: String(notification.priority || 'normal'),
  }
}

export async function onNotificationCreated(event) {
  const snapshot = event.data
  if (!snapshot) return

  const notificationId = snapshot.id
  const notification = snapshot.data()

  if (!notification?.delivery?.push) return

  const recipientIds = getNotificationRecipientIds(notification)
  if (!recipientIds.length) return

  const tokens = await getActiveTokensForUsers(recipientIds)
  if (!tokens.length) {
    await snapshot.ref.update({
      'delivery.pushStatus': 'no_tokens',
      'delivery.lastPushAttemptAt': FieldValue.serverTimestamp(),
    })
    return
  }

  let successCount = 0
  let failureCount = 0
  const batch = db.batch()

  for (let i = 0; i < tokens.length; i += 500) {
    const chunk = tokens.slice(i, i + 500)
    const response = await messaging.sendEachForMulticast({
      tokens: chunk.map((item) => item.token),
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: toFcmData(notificationId, notification),
      webpush: {
        fcmOptions: {
          link: notification.actionUrl || '/',
        },
      },
    })

    successCount += response.successCount
    failureCount += response.failureCount

    await Promise.all(response.responses.map(async (result, index) => {
      const tokenDoc = chunk[index]
      const errorCode = result.error?.code || null

      if (result.success) {
        await writeDeliveryLog({
          notificationId,
          recipientUserId: tokenDoc.userId,
          targetHash: sha256(tokenDoc.token),
          status: 'delivered',
          providerMessageId: result.messageId || null,
        })
        return
      }

      if (INVALID_TOKEN_CODES.has(errorCode)) {
        batch.update(db.collection(COLLECTIONS.NOTIFICATION_TOKENS).doc(tokenDoc.id), {
          enabled: false,
          revokedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }

      await writeDeliveryLog({
        notificationId,
        recipientUserId: tokenDoc.userId,
        targetHash: sha256(tokenDoc.token),
        status: INVALID_TOKEN_CODES.has(errorCode) ? 'invalid_token' : 'failed',
        errorCode,
        errorMessage: result.error?.message || null,
      })
    }))
  }

  batch.update(snapshot.ref, {
    'delivery.pushStatus': failureCount ? 'partial_or_failed' : 'delivered',
    'delivery.pushSuccessCount': successCount,
    'delivery.pushFailureCount': failureCount,
    'delivery.lastPushAttemptAt': FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  await batch.commit()

  if (failureCount) {
    await writeAuditLog({
      actionId: 'notifications.push.delivery_failed',
      entityType: 'notification',
      entityId: notificationId,
      source: 'notification-trigger',
      status: 'failure',
      severity: 'warning',
      result: { successCount, failureCount },
    })
  }
}
