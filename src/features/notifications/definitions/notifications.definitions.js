/** @file src/features/notifications/collections.definitions.js */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

const notifications = defineCollection({
  name: 'notifications',
  shard: { type: 'none' },
  schema: {
    recipientUserId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    recipientUserIds: { type: FIELD_TYPES.ARRAY, required: false },
    recipientRole: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    type: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    title: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    message: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    entityType: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    entityId: { type: FIELD_TYPES.STRING, required: false, filterable: true, searchable: true },
    actionUrl: { type: FIELD_TYPES.STRING, required: false },
    priority: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    delivery: { type: MAP, required: false },
    meta: { type: MAP, required: false },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    readAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    archivedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  indexes: [
    { fields: ['recipientUserId', 'status', 'createdAt'] },
    { fields: ['recipientUserId', 'createdAt'] },
    { fields: ['type', 'createdAt'] },
    { fields: ['entityType', 'entityId'] },
  ],
})



export default notifications
