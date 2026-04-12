import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file integrations/collections/integrationLogs.definitions.js */
export default defineCollection({
  name: 'integrationLogs',
  shard: { type: 'monthly' },
  schema: {
    integrationId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    provider: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    level: { type: FIELD_TYPES.STRING, required: true, enum: ['info', 'warning', 'error'], filterable: true },
    event: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    message: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    context: { type: FIELD_TYPES.MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: ['integrationId', 'provider', 'level', 'event', 'message', 'context'],
  updateableFields: ['level', 'message', 'context'],
  indexes: [{ fields: ['integrationId', 'createdAt'] }, { fields: ['provider', 'level'] }],
  search: { mode: 'token-array', fields: ['event', 'message'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
