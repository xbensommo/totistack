import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file search/collections/searchIndexes.definitions.js */
export default defineCollection({
  name: 'searchIndexes',
  shard: { type: 'monthly' },
  schema: {
    resourceType: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    resourceId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    title: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    summary: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    content: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    tokens: { type: FIELD_TYPES.ARRAY, required: false },
    facets: { type: FIELD_TYPES.MAP, required: false },
    scoreBoost: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    isPublished: { type: FIELD_TYPES.BOOLEAN, required: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: ['resourceType', 'resourceId', 'title', 'summary', 'content', 'tokens', 'facets', 'scoreBoost', 'isPublished'],
  updateableFields: ['title', 'summary', 'content', 'tokens', 'facets', 'scoreBoost', 'isPublished'],
  indexes: [{ fields: ['resourceType', 'isPublished'] }, { fields: ['resourceType', 'updatedAt'] }],
  search: { mode: 'token-array', fields: ['title', 'summary', 'content'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
