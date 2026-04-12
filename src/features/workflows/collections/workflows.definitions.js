import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file workflows/collections/workflows.definitions.js */
export default defineCollection({
  name: 'workflows',
  shard: { type: 'none' },
  schema: {
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    slug: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    description: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    status: { type: FIELD_TYPES.STRING, required: true, enum: ['draft', 'active', 'paused', 'archived'], filterable: true },
    trigger: { type: FIELD_TYPES.MAP, required: true },
    actions: { type: FIELD_TYPES.ARRAY, required: true },
    conditions: { type: FIELD_TYPES.ARRAY, required: false },
    retryPolicy: { type: FIELD_TYPES.MAP, required: false },
    lastRunAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, system: true, filterable: true },
  },
  writableFields: ['name', 'slug', 'description', 'status', 'trigger', 'actions', 'conditions', 'retryPolicy', 'lastRunAt'],
  updateableFields: ['name', 'slug', 'description', 'status', 'trigger', 'actions', 'conditions', 'retryPolicy', 'lastRunAt'],
  indexes: [{ fields: ['slug', 'status'] }, { fields: ['status', 'updatedAt'] }],
  search: { mode: 'token-array', fields: ['name', 'slug', 'description'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
