/**
 * @file collections/clientContacts.definitions.js
 * @description Collection contract for client contacts.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

export default defineCollection({
  name: 'clientContacts',
  shard: { type: 'none' },
  schema: {
    clientId: {
      type: FIELD_TYPES.STRING,
      required: true,
      filterable: true,
    },
    firstName: {
      type: FIELD_TYPES.STRING,
      required: true,
      searchable: true,
      sortable: true,
    },
    lastName: {
      type: FIELD_TYPES.STRING,
      required: true,
      searchable: true,
      sortable: true,
    },
    title: {
      type: FIELD_TYPES.STRING,
      searchable: true,
    },
    department: {
      type: FIELD_TYPES.STRING,
      searchable: true,
    },
    email: {
      type: FIELD_TYPES.STRING,
      required: true,
      searchable: true,
      filterable: true,
    },
    phone: {
      type: FIELD_TYPES.STRING,
      filterable: true,
    },
    mobile: {
      type: FIELD_TYPES.STRING,
      filterable: true,
    },
    role: {
      type: FIELD_TYPES.STRING,
      enum: ['primary', 'billing', 'technical', 'executive', 'other'],
      filterable: true,
      sortable: true,
    },
    isPrimary: {
      type: FIELD_TYPES.BOOLEAN,
      filterable: true,
    },
    receivesNotifications: {
      type: FIELD_TYPES.BOOLEAN,
      filterable: true,
    },
    preferences: {
      type: FIELD_TYPES.MAP,
      required: false,
    },
    notes: {
      type: FIELD_TYPES.STRING,
      searchable: true,
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
  writableFields: [
    'clientId',
    'firstName',
    'lastName',
    'title',
    'department',
    'email',
    'phone',
    'mobile',
    'role',
    'isPrimary',
    'receivesNotifications',
    'preferences',
    'notes',
  ],
  updateableFields: [
    'firstName',
    'lastName',
    'title',
    'department',
    'email',
    'phone',
    'mobile',
    'role',
    'isPrimary',
    'receivesNotifications',
    'preferences',
    'notes',
  ],
  indexes: [
    { fields: ['clientId', 'updatedAt'] },
    { fields: ['email', 'updatedAt'] },
    { fields: ['clientId', 'isPrimary'] },
    { fields: ['role', 'updatedAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['firstName', 'lastName', 'title', 'department', 'email', 'notes'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'managerOrAdmin',
    delete: 'admin',
  },
})
