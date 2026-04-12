import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/**
 * @file forms/collections/forms.definitions.js
 * @description Main form definitions collection.
 */
export default defineCollection({
  name: 'forms',
  shard: { type: 'none' },
  schema: {
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    slug: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    description: { type: FIELD_TYPES.STRING, searchable: true },
    status: { type: FIELD_TYPES.STRING, required: true, enum: ['draft', 'published', 'archived'], filterable: true, sortable: true },
    settings: { type: FIELD_TYPES.MAP, required: false },
    notifications: { type: FIELD_TYPES.ARRAY, required: false },
    integrations: { type: FIELD_TYPES.ARRAY, required: false },
    fieldsCount: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    totalSubmissions: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, system: true, filterable: true },
  },
  writableFields: ['name', 'slug', 'description', 'status', 'settings', 'notifications', 'integrations', 'fieldsCount', 'totalSubmissions'],
  updateableFields: ['name', 'slug', 'description', 'status', 'settings', 'notifications', 'integrations', 'fieldsCount', 'totalSubmissions'],
  indexes: [{ fields: ['slug', 'status'] }, { fields: ['status', 'createdAt'] }, { fields: ['createdBy', 'createdAt'] }],
  search: { mode: 'token-array', fields: ['name', 'slug', 'description'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
