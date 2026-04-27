/**
 * @file apps/crm/collections/crm_contacts.definitions.js
 * @description Contact records for CRM people linked to leads, accounts, and opportunities.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'crm_contacts',
  shard: { type: 'none' },
  schema: {
    firstName: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    lastName: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    fullName: { type: FIELD_TYPES.STRING, required: false, searchable: true, sortable: true },
    leadId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    accountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    email: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    phone: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    mobile: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    role: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    lifecycleStage: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    status: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    owner: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    team: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    tags: { type: FIELD_TYPES.ARRAY, required: false },
    lastInteractionAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'firstName', 'lastName', 'fullName', 'leadId', 'accountId', 'email', 'phone', 'mobile',
    'role', 'lifecycleStage', 'status', 'owner', 'team', 'tags', 'lastInteractionAt', 'createdBy',
  ],
  updateableFields: [
    'firstName', 'lastName', 'fullName', 'leadId', 'accountId', 'email', 'phone', 'mobile',
    'role', 'lifecycleStage', 'status', 'owner', 'team', 'tags', 'lastInteractionAt',
  ],
  indexes: [
    { fields: ['accountId', 'createdAt'] },
    { fields: ['owner', 'status'] },
    { fields: ['email', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['firstName', 'lastName', 'fullName', 'email', 'role'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOrManager',
  },
});
