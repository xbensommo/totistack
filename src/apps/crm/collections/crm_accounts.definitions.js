/**
 * @file apps/crm/collections/crm_accounts.definitions.js
 * @description Account or company records for the CRM.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'crm_accounts',
  shard: { type: 'none' },
  schema: {
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    accountNumber: { type: FIELD_TYPES.STRING, required: false, searchable: true, sortable: true, filterable: true },
    industry: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    website: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    email: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    phone: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    source: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    owner: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    team: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    billingAddress: { type: FIELD_TYPES.STRING, required: false },
    shippingAddress: { type: FIELD_TYPES.STRING, required: false },
    tags: { type: FIELD_TYPES.ARRAY, required: false },
    lastInteractionAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'name', 'accountNumber', 'industry', 'website', 'email', 'phone', 'source', 'status',
    'owner', 'team', 'billingAddress', 'shippingAddress', 'tags', 'lastInteractionAt', 'createdBy',
  ],
  updateableFields: [
    'name', 'accountNumber', 'industry', 'website', 'email', 'phone', 'source', 'status',
    'owner', 'team', 'billingAddress', 'shippingAddress', 'tags', 'lastInteractionAt',
  ],
  indexes: [
    { fields: ['owner', 'status'] },
    { fields: ['industry', 'createdAt'] },
    { fields: ['accountNumber', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['name', 'accountNumber', 'industry', 'website', 'email'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOrManager',
  },
});
