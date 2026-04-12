import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file integrations/collections/integrations.definitions.js */
export default defineCollection({
  name: 'integrations',
  shard: { type: 'none' },
  schema: {
    provider: { type: FIELD_TYPES.STRING, required: true, filterable: true, searchable: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    category: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: true, enum: ['draft', 'connected', 'error', 'disabled'], filterable: true, sortable: true },
    environment: { type: FIELD_TYPES.STRING, required: false, enum: ['sandbox', 'production'], filterable: true },
    credentials: { type: FIELD_TYPES.MAP, required: false },
    config: { type: FIELD_TYPES.MAP, required: false },
    health: { type: FIELD_TYPES.MAP, required: false },
    lastSyncedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, system: true, filterable: true },
  },
  writableFields: ['provider', 'name', 'category', 'status', 'environment', 'credentials', 'config', 'health', 'lastSyncedAt'],
  updateableFields: ['name', 'category', 'status', 'environment', 'credentials', 'config', 'health', 'lastSyncedAt'],
  indexes: [{ fields: ['provider', 'status'] }, { fields: ['status', 'updatedAt'] }],
  search: { mode: 'token-array', fields: ['provider', 'name', 'category'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
