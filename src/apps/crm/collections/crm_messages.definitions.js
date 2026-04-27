/**
 * @file apps/crm/collections/crm_messages.definitions.js
 * @description Logged WhatsApp, email, and other CRM communication records.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'crm_messages',
  shard: { type: 'none' },
  schema: {
    leadId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    contactId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    accountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    opportunityId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    channel: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    direction: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    subject: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    body: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    to: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    from: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    status: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    providerMessageId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    loggedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    owner: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    team: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'leadId', 'contactId', 'accountId', 'opportunityId', 'channel', 'direction', 'subject', 'body',
    'to', 'from', 'status', 'providerMessageId', 'loggedAt', 'owner', 'team', 'createdBy',
  ],
  updateableFields: [
    'subject', 'body', 'status', 'providerMessageId', 'loggedAt', 'owner', 'team',
  ],
  indexes: [
    { fields: ['channel', 'createdAt'] },
    { fields: ['accountId', 'createdAt'] },
    { fields: ['owner', 'status'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['subject', 'body', 'to', 'from'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOrManager',
  },
});
