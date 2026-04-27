/** @file functions/src/notifications/createNotification.js */

import { db, FieldValue } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'
import { notificationRegistry } from '../generated/notifications.registry.js'

function interpolateTemplate(template, values = {}) {
  if (!template || typeof template !== 'string') return template

  return template.replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_match, key) => {
    const resolved = key.split('.').reduce((acc, part) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, part)) return acc[part]
      return undefined
    }, values)

    return resolved === undefined || resolved === null ? '' : String(resolved)
  })
}

export async function createNotification({
  recipientUserId = null,
  recipientUserIds = null,
  recipientRole = null,
  type,
  title = null,
  message = null,
  entityType = null,
  entityId = null,
  actionUrl = null,
  priority = null,
  createdBy = 'system',
  delivery = null,
  meta = {},
} = {}) {
  if (!recipientUserId && !Array.isArray(recipientUserIds) && !recipientRole) {
    throw new Error('Notification requires recipientUserId, recipientUserIds, or recipientRole.')
  }

  if (!type) {
    throw new Error('Notification requires type.')
  }

  const definition = notificationRegistry[type] || null
  const templateContext = {
    meta,
    entityType,
    entityId,
    recipientUserId,
    recipientUserIds,
    recipientRole,
  }

  const resolvedTitle = title || interpolateTemplate(definition?.title, templateContext)
  const resolvedMessage = message || interpolateTemplate(definition?.message, templateContext)

  if (!resolvedTitle || !resolvedMessage) {
    throw new Error(
      `Notification ${type} requires title and message, either directly or through a generated notification definition.`,
    )
  }

  const payload = {
    recipientUserId,
    recipientUserIds: Array.isArray(recipientUserIds) ? recipientUserIds : [],
    recipientRole,
    type,
    title: resolvedTitle,
    message: resolvedMessage,
    entityType: entityType || definition?.entityType || null,
    entityId,
    actionUrl: actionUrl || definition?.actionUrl || null,
    priority: priority || definition?.priority || 'normal',
    status: 'unread',
    delivery: {
      push: true,
      ...(definition?.delivery || {}),
      ...(delivery || {}),
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
