import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file workflows/collections/workflowTriggers.definitions.js */
export default defineCollection({
  name: 'workflowTriggers',
  shard: { type: 'none' },
  schema: {
    workflowId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    type: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    event: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    isActive: { type: FIELD_TYPES.BOOLEAN, required: true, filterable: true },
    config: { type: FIELD_TYPES.MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
  },
  writableFields: ['workflowId', 'type', 'event', 'isActive', 'config'],
  updateableFields: ['type', 'event', 'isActive', 'config'],
  indexes: [{ fields: ['workflowId', 'isActive'] }, { fields: ['event', 'isActive'] }],
  search: { mode: 'token-array', fields: ['event'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
