import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

/**
 * @file forms/collections/formSubmissions.definitions.js
 * @description Submitted form payloads and moderation status.
 */
export default defineCollection({
  name: 'formSubmissions',
  shard: { type: 'monthly' },
  schema: {
    formId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    formSlug: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: true, enum: ['new', 'reviewed', 'flagged', 'archived'], filterable: true, sortable: true },
    payload: { type: FIELD_TYPES.MAP, required: true },
    spamScore: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    source: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    submittedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, system: true, filterable: true },
  },
  writableFields: ['formId', 'formSlug', 'status', 'payload', 'spamScore', 'source', 'submittedAt'],
  updateableFields: ['status', 'spamScore'],
  indexes: [{ fields: ['formId', 'submittedAt'] }, { fields: ['status', 'submittedAt'] }, { fields: ['formSlug', 'submittedAt'] }],
  rules: { read: 'auth', create: 'auth', update: 'auth', delete: 'auth' },
})
