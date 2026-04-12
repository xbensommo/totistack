import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file search/collections/searchSynonyms.definitions.js */
export default defineCollection({
  name: 'searchSynonyms',
  shard: { type: 'none' },
  schema: {
    term: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    synonyms: { type: FIELD_TYPES.ARRAY, required: true },
    language: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    isActive: { type: FIELD_TYPES.BOOLEAN, required: true, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
  },
  writableFields: ['term', 'synonyms', 'language', 'isActive'],
  updateableFields: ['term', 'synonyms', 'language', 'isActive'],
  indexes: [{ fields: ['term', 'isActive'] }],
  search: { mode: 'token-array', fields: ['term'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
