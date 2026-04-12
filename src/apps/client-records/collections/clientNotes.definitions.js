/**
 * @file collections/clientNotes.definitions.js
 * @description Collection contract for client notes.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

export default defineCollection({
  name: 'clientNotes',
  shard: { type: 'monthly' },
  schema: {
    clientId: {
      type: FIELD_TYPES.STRING,
      required: true,
      filterable: true,
    },
    userId: {
      type: FIELD_TYPES.STRING,
      required: true,
      filterable: true,
    },
    content: {
      type: FIELD_TYPES.STRING,
      required: true,
      searchable: true,
    },
    type: {
      type: FIELD_TYPES.STRING,
      enum: ['general', 'internal', 'billing', 'support'],
      filterable: true,
      sortable: true,
    },
    isPublic: {
      type: FIELD_TYPES.BOOLEAN,
      filterable: true,
    },
    createdAt: {
      type: FIELD_TYPES.TIMESTAMP,
      readonly: true,
      system: true,
      sortable: true,
      filterable: true,
    },
    updatedAt: {
      type: FIELD_TYPES.TIMESTAMP,
      readonly: true,
      system: true,
      sortable: true,
      filterable: true,
    },
    createdBy: {
      type: FIELD_TYPES.STRING,
      readonly: true,
      system: true,
      filterable: true,
    },
  },
  writableFields: ['clientId', 'userId', 'content', 'type', 'isPublic'],
  updateableFields: ['content', 'type', 'isPublic'],
  indexes: [
    { fields: ['clientId', 'createdAt'] },
    { fields: ['type', 'createdAt'] },
    { fields: ['userId', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['content'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'managerOrAdmin',
    delete: 'admin',
  },
})
