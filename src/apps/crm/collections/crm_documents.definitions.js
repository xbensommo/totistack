/**
 * @file apps/crm/collections/crm_documents.definitions.js
 * @description Quotes, invoices, receipts, and other customer-facing documents.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'crm_documents',
  shard: { type: 'none' },
  schema: {
    documentType: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    documentNumber: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true, filterable: true },
    title: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    leadId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    contactId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    accountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    opportunityId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    currency: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    subtotal: { type: FIELD_TYPES.NUMBER, required: false, sortable: true, filterable: true },
    taxAmount: { type: FIELD_TYPES.NUMBER, required: false, sortable: true, filterable: true },
    totalAmount: { type: FIELD_TYPES.NUMBER, required: false, sortable: true, filterable: true },
    issuedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    dueAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    paidAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    templateKey: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    placeholderPayload: { type: FIELD_TYPES.OBJECT, required: false },
    lineItems: { type: FIELD_TYPES.ARRAY, required: false },
    generatedByPackage: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    owner: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    team: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'documentType', 'documentNumber', 'title', 'leadId', 'contactId', 'accountId', 'opportunityId',
    'status', 'currency', 'subtotal', 'taxAmount', 'totalAmount', 'issuedAt', 'dueAt', 'paidAt',
    'templateKey', 'placeholderPayload', 'lineItems', 'generatedByPackage', 'owner', 'team', 'createdBy',
  ],
  updateableFields: [
    'title', 'leadId', 'contactId', 'accountId', 'opportunityId', 'status', 'currency', 'subtotal',
    'taxAmount', 'totalAmount', 'issuedAt', 'dueAt', 'paidAt', 'templateKey', 'placeholderPayload',
    'lineItems', 'generatedByPackage', 'owner', 'team',
  ],
  indexes: [
    { fields: ['documentType', 'createdAt'] },
    { fields: ['accountId', 'status'] },
    { fields: ['documentNumber', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['title', 'documentNumber'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOrManager',
  },
});
