import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

/**
 * @file apps/crm/collections/crm_activities.collection.js
 * @description Shard-provider collection definition for CRM activities.
 */

const crmActivities = defineCollection({
  name: 'crm_activities',
  shard: { type: 'none' },
  schema: {
    leadId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    contactId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    accountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    opportunityId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    type: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    subtype: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    subject: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    description: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    duration: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    outcome: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    scheduledAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    completedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    assignedTo: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    isPrivate: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
  },
  writableFields: [
    'leadId',
    'contactId',
    'accountId',
    'opportunityId',
    'type',
    'subtype',
    'subject',
    'description',
    'duration',
    'outcome',
    'scheduledAt',
    'completedAt',
    'assignedTo',
    'createdBy',
    'isPrivate',
    'createdAt',
    'updatedAt',
  ],
  updateableFields: [
    'leadId',
    'contactId',
    'accountId',
    'opportunityId',
    'type',
    'subtype',
    'subject',
    'description',
    'duration',
    'outcome',
    'scheduledAt',
    'completedAt',
    'assignedTo',
    'createdBy',
    'isPrivate',
    'createdAt',
  ],
  indexes: [
    { fields: ['leadId', 'createdAt'] },
    { fields: ['opportunityId', 'createdAt'] },
    { fields: ['assignedTo', 'scheduledAt'] },
    { fields: ['type', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['subject', 'description'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOrManager',
  },
});

export default crmActivities;
