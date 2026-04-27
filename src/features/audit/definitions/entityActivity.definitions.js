/** @file src/features/audit/collections.definitions.js */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export const entityActivity= defineCollection({
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
    meta: { type: MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  indexes: [
    { fields: ['entityType', 'entityId', 'createdAt'] },
    { fields: ['actorId', 'createdAt'] },
    { fields: ['actionId', 'createdAt'] },
  ],
})

export const entityActivityCollection
