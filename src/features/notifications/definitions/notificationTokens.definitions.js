/** @file src/features/notifications/collections.definitions.js */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export const notificationTokens = defineCollection({
  name: 'notificationTokens',
  shard: { type: 'none' },
  schema: {
    userId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    tokenHash: { type: FIELD_TYPES.STRING, required: true, filterable: true, searchable: true },
    token: { type: FIELD_TYPES.STRING, required: true },
    platform: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    browser: { type: FIELD_TYPES.STRING, required: false },
    deviceLabel: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    enabled: { type: FIELD_TYPES.BOOLEAN, required: true, filterable: true, sortable: true },
    lastSeenAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    revokedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  indexes: [
    { fields: ['userId', 'enabled'] },
    { fields: ['tokenHash'] },
    { fields: ['enabled', 'lastSeenAt'] },
  ],
})

export default notificationTokens
