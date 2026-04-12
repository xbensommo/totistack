import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/** @file media/collections/mediaFiles.definitions.js */
export default defineCollection({
  name: 'mediaFiles',
  shard: { type: 'monthly' },
  schema: {
    folderId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    originalName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    mimeType: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    extension: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    size: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    storagePath: { type: FIELD_TYPES.STRING, required: true },
    publicUrl: { type: FIELD_TYPES.STRING, required: false },
    altText: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    tags: { type: FIELD_TYPES.ARRAY, required: false },
    metadata: { type: FIELD_TYPES.MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, system: true, filterable: true },
  },
  writableFields: ['folderId', 'name', 'originalName', 'mimeType', 'extension', 'size', 'storagePath', 'publicUrl', 'altText', 'tags', 'metadata'],
  updateableFields: ['folderId', 'name', 'altText', 'tags', 'metadata', 'publicUrl'],
  indexes: [{ fields: ['folderId', 'createdAt'] }, { fields: ['mimeType', 'createdAt'] }],
  search: { mode: 'token-array', fields: ['name', 'originalName', 'altText'] },
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
