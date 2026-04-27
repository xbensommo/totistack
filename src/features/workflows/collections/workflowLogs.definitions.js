import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file workflows/collections/workflowLogs.definitions.js */
export default defineCollection({
  name: 'workflowLogs',
  shard: { type: 'none' },
  schema: {
    workflowId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    workflowRunId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    level: { type: FIELD_TYPES.STRING, required: true, enum: ['info', 'warning', 'error'], filterable: true },
    message: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    context: { type: FIELD_TYPES.MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: ['workflowId', 'workflowRunId', 'level', 'message', 'context'],
  updateableFields: ['level', 'message', 'context'],
  indexes: [{ fields: ['workflowId', 'createdAt'] }, { fields: ['workflowRunId', 'createdAt'] }],
  search: { mode: 'token-array', fields: ['message'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
