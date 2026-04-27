/** @file src/features/notifications/collections.definitions.js */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT


export const notificationPreferences = defineCollection({
  name: 'notificationPreferences',
  shard: { type: 'none' },
  schema: {
    userId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    enabled: { type: FIELD_TYPES.BOOLEAN, required: true, filterable: true },
    pushEnabled: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    emailEnabled: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    channels: { type: FIELD_TYPES.ARRAY, required: false },
    eventSettings: { type: MAP, required: false },
    quietHours: { type: MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  indexes: [{ fields: ['userId'] }],
})

