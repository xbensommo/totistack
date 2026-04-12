/**
 * @file collections/clients.definitions.js
 * @description Collection contract for master client records.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

export default defineCollection({
  name: 'clients',
  shard: { type: 'none' },
  schema: {
    clientNumber: {
      type: FIELD_TYPES.STRING,
      required: true,
      sortable: true,
      filterable: true,
      searchable: true,
    },
    type: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: ['individual', 'business', 'nonprofit', 'government'],
      filterable: true,
      sortable: true,
    },
    companyName: {
      type: FIELD_TYPES.STRING,
      searchable: true,
      sortable: true,
    },
    firstName: {
      type: FIELD_TYPES.STRING,
      searchable: true,
      sortable: true,
    },
    lastName: {
      type: FIELD_TYPES.STRING,
      searchable: true,
      sortable: true,
    },
    email: {
      type: FIELD_TYPES.STRING,
      searchable: true,
      filterable: true,
    },
    phone: {
      type: FIELD_TYPES.STRING,
      filterable: true,
    },
    status: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: ['active', 'inactive', 'lead', 'prospect', 'churned', 'blocked'],
      filterable: true,
      sortable: true,
    },
    lifecycleStage: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: ['lead', 'opportunity', 'customer', 'advocate', 'churned'],
      filterable: true,
      sortable: true,
    },
    leadSource: {
      type: FIELD_TYPES.STRING,
      searchable: true,
      filterable: true,
    },
    leadScore: {
      type: FIELD_TYPES.NUMBER,
      sortable: true,
      filterable: true,
    },
    lifetimeValue: {
      type: FIELD_TYPES.NUMBER,
      sortable: true,
      filterable: true,
    },
    assignedTo: {
      type: FIELD_TYPES.STRING,
      filterable: true,
    },
    primaryContactId: {
      type: FIELD_TYPES.STRING,
      filterable: true,
    },
    tags: {
      type: FIELD_TYPES.ARRAY,
      required: false,
    },
    communicationPreferences: {
      type: FIELD_TYPES.MAP,
      required: false,
    },
    customFields: {
      type: FIELD_TYPES.MAP,
      required: false,
    },
    metadata: {
      type: FIELD_TYPES.MAP,
      required: false,
    },
    lastActivityAt: {
      type: FIELD_TYPES.TIMESTAMP,
      sortable: true,
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
  writableFields: [
    'clientNumber',
    'type',
    'companyName',
    'firstName',
    'lastName',
    'email',
    'phone',
    'status',
    'lifecycleStage',
    'leadSource',
    'leadScore',
    'lifetimeValue',
    'assignedTo',
    'primaryContactId',
    'tags',
    'communicationPreferences',
    'customFields',
    'metadata',
    'lastActivityAt',
  ],
  updateableFields: [
    'type',
    'companyName',
    'firstName',
    'lastName',
    'email',
    'phone',
    'status',
    'lifecycleStage',
    'leadSource',
    'leadScore',
    'lifetimeValue',
    'assignedTo',
    'primaryContactId',
    'tags',
    'communicationPreferences',
    'customFields',
    'metadata',
    'lastActivityAt',
  ],
  indexes: [
    { fields: ['clientNumber', 'createdAt'] },
    { fields: ['status', 'updatedAt'] },
    { fields: ['assignedTo', 'updatedAt'] },
    { fields: ['lifecycleStage', 'updatedAt'] },
    { fields: ['leadScore', 'updatedAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['clientNumber', 'companyName', 'firstName', 'lastName', 'email', 'leadSource'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'managerOrAdmin',
    delete: 'admin',
  },
})
