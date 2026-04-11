/**
 * @file crm/collections/crm_activities.definitions.js
 * @description Activity collection definition aligned to shard-provider and generated assembly.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

export default defineCollection({
  name: 'crm_activities',
  shard: { type: 'month' },
  schema: {
    leadId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    contactId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    accountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    opportunityId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    type: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: ['call', 'email', 'meeting', 'task', 'note', 'quote', 'order', 'lead_assign', 'stage_change', 'view', 'edit'],
      filterable: true,
      sortable: true,
    },
    subtype: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    subject: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    description: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    duration: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    outcome: {
      type: FIELD_TYPES.STRING,
      required: false,
      enum: ['completed', 'no_answer', 'left_message', 'scheduled', 'cancelled', 'pending'],
      filterable: true,
    },
    communication: { type: FIELD_TYPES.MAP, required: false },
    attachments: { type: FIELD_TYPES.ARRAY, required: false },
    scheduledAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    completedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    assignedTo: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, system: true, filterable: true },
    isPrivate: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'leadId', 'contactId', 'accountId', 'opportunityId', 'type', 'subtype', 'subject', 'description', 'duration',
    'outcome', 'communication', 'attachments', 'scheduledAt', 'completedAt', 'assignedTo', 'isPrivate', 'createdBy',
  ],
  updateableFields: [
    'type', 'subtype', 'subject', 'description', 'duration', 'outcome', 'communication', 'attachments',
    'scheduledAt', 'completedAt', 'assignedTo', 'isPrivate',
  ],
  indexes: [
    { fields: ['leadId', 'createdAt'] },
    { fields: ['contactId', 'createdAt'] },
    { fields: ['opportunityId', 'createdAt'] },
    { fields: ['assignedTo', 'scheduledAt'] },
    { fields: ['type', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['subject', 'description', 'subtype'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOnly',
  },
})
