/**
 * @file apps/crm/collections/crm_attachments.definitions.js
 * @description File metadata attached to CRM records.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'crm_attachments',
  shard: { type: 'none' },
  schema: {
    leadId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    contactId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    accountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    opportunityId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    taskId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    documentId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    fileName: { type: FIELD_TYPES.STRING, required: true, searchable: true },
    fileType: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    fileSize: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    storagePath: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    downloadUrl: { type: FIELD_TYPES.STRING, required: false },
    visibility: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    uploadedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'leadId', 'contactId', 'accountId', 'opportunityId', 'taskId', 'documentId', 'fileName',
    'fileType', 'fileSize', 'storagePath', 'downloadUrl', 'visibility', 'uploadedBy',
  ],
  updateableFields: [
    'fileName', 'fileType', 'fileSize', 'storagePath', 'downloadUrl', 'visibility',
  ],
  indexes: [
    { fields: ['documentId', 'createdAt'] },
    { fields: ['accountId', 'createdAt'] },
    { fields: ['fileType', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['fileName', 'storagePath'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOrManager',
  },
});
