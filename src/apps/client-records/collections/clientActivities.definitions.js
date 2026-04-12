/**
 * @file collections/clientActivities.definitions.js
 * @description Collection contract for client activity timelines.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

export default defineCollection({
  name: 'clientActivities',
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
    type: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: [
        'call',
        'email',
        'meeting',
        'note',
        'task',
        'order',
        'booking',
        'view',
        'edit',
        'status_change',
        'payment',
        'support_ticket',
      ],
      filterable: true,
      sortable: true,
    },
    action: {
      type: FIELD_TYPES.STRING,
      required: true,
      searchable: true,
    },
    description: {
      type: FIELD_TYPES.STRING,
      searchable: true,
    },
    referenceType: {
      type: FIELD_TYPES.STRING,
      filterable: true,
    },
    referenceId: {
      type: FIELD_TYPES.STRING,
      filterable: true,
    },
    metadata: {
      type: FIELD_TYPES.MAP,
      required: false,
    },
    duration: {
      type: FIELD_TYPES.NUMBER,
      filterable: true,
      sortable: true,
    },
    outcome: {
      type: FIELD_TYPES.STRING,
      enum: ['completed', 'missed', 'scheduled', 'rescheduled', 'cancelled'],
      filterable: true,
      sortable: true,
    },
    priority: {
      type: FIELD_TYPES.STRING,
      enum: ['low', 'medium', 'high', 'urgent'],
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
    createdBy: {
      type: FIELD_TYPES.STRING,
      readonly: true,
      system: true,
      filterable: true,
    },
  },
  writableFields: [
    'clientId',
    'userId',
    'type',
    'action',
    'description',
    'referenceType',
    'referenceId',
    'metadata',
    'duration',
    'outcome',
    'priority',
    'isPublic',
  ],
  updateableFields: ['description', 'metadata', 'duration', 'outcome', 'priority', 'isPublic'],
  indexes: [
    { fields: ['clientId', 'createdAt'] },
    { fields: ['type', 'createdAt'] },
    { fields: ['userId', 'createdAt'] },
    { fields: ['referenceType', 'referenceId'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['action', 'description'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'managerOrAdmin',
    delete: 'admin',
  },
})
