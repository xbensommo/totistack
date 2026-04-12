import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file media/collections/mediaFolders.definitions.js */
export default defineCollection({
  name: 'mediaFolders',
  shard: { type: 'none' },
  schema: {
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    slug: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    parentId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    visibility: { type: FIELD_TYPES.STRING, required: true, enum: ['private', 'shared', 'public'], filterable: true },
    description: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, system: true, filterable: true },
  },
  writableFields: ['name', 'slug', 'parentId', 'visibility', 'description'],
  updateableFields: ['name', 'slug', 'parentId', 'visibility', 'description'],
  indexes: [{ fields: ['parentId', 'name'] }, { fields: ['visibility', 'createdAt'] }],
  search: { mode: 'token-array', fields: ['name', 'slug', 'description'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
