/** @file src/features/notifications/collections.definitions.js */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export const notificationDeliveries = defineCollection({
  name: 'notificationDeliveries',
  shard: { type: 'none' },
  schema: {
    notificationId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    recipientUserId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    channel: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    provider: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    targetHash: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    attempts: { type: FIELD_TYPES.NUMBER, required: true, sortable: true },
    errorCode: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    errorMessage: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    providerMessageId: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    lastAttemptAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    deliveredAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    nextRetryAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  indexes: [
    { fields: ['notificationId'] },
    { fields: ['status', 'nextRetryAt'] },
    { fields: ['recipientUserId', 'createdAt'] },
  ],
})
