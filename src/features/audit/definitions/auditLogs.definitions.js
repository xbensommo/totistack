/** @file src/features/audit/collections.definitions.js */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export const auditLogs = defineCollection({
  name: 'auditLogs',
  shard: { type: 'none' },
  schema: {
    actorId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    actorEmail: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    actionId: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    operationId: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    entityType: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    entityId: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    source: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    severity: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    reason: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    before: { type: MAP, required: false },
    after: { type: MAP, required: false },
    changes: { type: FIELD_TYPES.ARRAY, required: false },
    request: { type: MAP, required: false },
    result: { type: MAP, required: false },
    errorCode: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    errorMessage: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    meta: { type: MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  indexes: [
    { fields: ['actionId', 'createdAt'] },
    { fields: ['actorId', 'createdAt'] },
    { fields: ['entityType', 'entityId'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['severity', 'createdAt'] },
  ],
})

export const auditLogs

