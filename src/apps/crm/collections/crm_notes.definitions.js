/**
 * @file apps/crm/collections/crm_notes.definitions.js
 * @description CRM notes and timeline commentary linked to people, companies, and deals.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'crm_notes',
  shard: { type: 'none' },
  schema: {
    leadId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    contactId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    accountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    opportunityId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    taskId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    title: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    body: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    visibility: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    pinned: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    assignedTo: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    team: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'leadId', 'contactId', 'accountId', 'opportunityId', 'taskId', 'title', 'body',
    'visibility', 'pinned', 'createdBy', 'assignedTo', 'team',
  ],
  updateableFields: [
    'title', 'body', 'visibility', 'pinned', 'assignedTo', 'team',
  ],
  indexes: [
    { fields: ['leadId', 'createdAt'] },
    { fields: ['contactId', 'createdAt'] },
    { fields: ['accountId', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['title', 'body'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOrManager',
  },
});
