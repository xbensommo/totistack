import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file workflows/collections/workflowRuns.definitions.js */
export default defineCollection({
  name: 'workflowRuns',
  shard: { type: 'none' },
  schema: {
    workflowId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    workflowName: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    status: { type: FIELD_TYPES.STRING, required: true, enum: ['queued', 'running', 'completed', 'failed'], filterable: true },
    triggerType: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    payload: { type: FIELD_TYPES.MAP, required: false },
    output: { type: FIELD_TYPES.MAP, required: false },
    startedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    finishedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: ['workflowId', 'workflowName', 'status', 'triggerType', 'payload', 'output', 'startedAt', 'finishedAt'],
  updateableFields: ['status', 'payload', 'output', 'startedAt', 'finishedAt'],
  indexes: [{ fields: ['workflowId', 'createdAt'] }, { fields: ['status', 'createdAt'] }],
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
