import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file search/collections/searchQueries.definitions.js */
export default defineCollection({
  name: 'searchQueries',
  shard: { type: 'monthly' },
  schema: {
    query: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    resultCount: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    filters: { type: FIELD_TYPES.MAP, required: false },
    source: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, system: true, filterable: true },
  },
  writableFields: ['query', 'resultCount', 'filters', 'source'],
  updateableFields: ['resultCount', 'filters', 'source'],
  indexes: [{ fields: ['query', 'createdAt'] }, { fields: ['source', 'createdAt'] }],
  search: { mode: 'token-array', fields: ['query'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
