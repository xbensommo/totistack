/** @file src/features/server-actions/collections.definitions.js */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export const actionRequests = defineCollection({
  name: 'actionRequests',
  shard: { type: 'none' },
  schema: {
    actionId: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    operationId: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    actorId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    actorEmail: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    entityType: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    entityId: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    reason: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    input: { type: MAP, required: false },
    result: { type: MAP, required: false },
    errorCode: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    errorMessage: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    startedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    completedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    failedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: [],
  indexes: [
    { fields: ['actionId', 'createdAt'] },
    { fields: ['actorId', 'createdAt'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['entityType', 'entityId'] },
    { fields: ['operationId'] },
  ],
})

