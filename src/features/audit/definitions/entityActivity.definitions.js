/**
 * @file src/features/audit/definitions/entityActivity.definitions.js
 * @description User-facing activity timeline derived from audit evidence.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export const entityActivity = defineCollection({
  name: 'entityActivity',
  shard: { type: 'none' },
  schema: {
    entityType: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    entityId: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    actionId: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    actorId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    actorName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    summary: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    severity: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    operationId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    correlationId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    auditLogId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    visibility: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    meta: { type: MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: [
    'entityType', 'entityId', 'actionId', 'actorId', 'actorName', 'summary', 'severity', 'operationId',
    'correlationId', 'auditLogId', 'visibility', 'meta', 'isDeleted',
  ],
  updateableFields: ['summary', 'visibility', 'meta', 'isDeleted'],
  indexes: [
    { fields: ['entityType', 'entityId', 'createdAt'] },
    { fields: ['actorId', 'createdAt'] },
    { fields: ['actionId', 'createdAt'] },
    { fields: ['correlationId', 'createdAt'] },
    { fields: ['visibility', 'createdAt'] },
    { fields: ['isDeleted', 'createdAt'] },
  ],
  rules: {
    read: 'permission:audit.view',
    create: 'serverOnly',
    update: 'serverOnly',
    delete: 'serverOnly',
  },
})


