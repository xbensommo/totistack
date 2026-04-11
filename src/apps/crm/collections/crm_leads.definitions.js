/**
 * @file crm/collections/crm_leads.definitions.js
 * @description Lead collection definition aligned to shard-provider and generated assembly.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

export default defineCollection({
  name: 'crm_leads',
  shard: { type: 'none' },
  schema: {
    leadNumber: { type: FIELD_TYPES.STRING, required: true, sortable: true, filterable: true },
    firstName: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    lastName: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    fullName: { type: FIELD_TYPES.STRING, required: false, searchable: true, sortable: true },
    email: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    phone: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    company: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true, sortable: true },
    title: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    website: { type: FIELD_TYPES.STRING, required: false },
    source: {
      type: FIELD_TYPES.STRING,
      required: false,
      enum: ['website', 'referral', 'social', 'email', 'event', 'cold_call', 'ad', 'other'],
      filterable: true,
      sortable: true,
    },
    status: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'],
      filterable: true,
      sortable: true,
    },
    qualification: { type: FIELD_TYPES.MAP, required: false },
    score: { type: FIELD_TYPES.MAP, required: false },
    convertedTo: { type: FIELD_TYPES.MAP, required: false },
    assignedTo: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    assignedTeam: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    tags: { type: FIELD_TYPES.ARRAY, required: false },
    notes: { type: FIELD_TYPES.ARRAY, required: false },
    lastActivityAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    nextFollowUp: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, system: true, filterable: true },
  },
  writableFields: [
    'leadNumber', 'firstName', 'lastName', 'fullName', 'email', 'phone', 'company', 'title', 'website',
    'source', 'status', 'qualification', 'score', 'convertedTo', 'assignedTo', 'assignedTeam', 'tags', 'notes',
    'lastActivityAt', 'nextFollowUp', 'createdBy',
  ],
  updateableFields: [
    'firstName', 'lastName', 'fullName', 'email', 'phone', 'company', 'title', 'website',
    'source', 'status', 'qualification', 'score', 'convertedTo', 'assignedTo', 'assignedTeam', 'tags', 'notes',
    'lastActivityAt', 'nextFollowUp',
  ],
  indexes: [
    { fields: ['leadNumber', 'createdAt'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['assignedTo', 'status'] },
    { fields: ['company', 'createdAt'] },
    { fields: ['nextFollowUp', 'status'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['leadNumber', 'firstName', 'lastName', 'fullName', 'email', 'phone', 'company', 'title'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOnly',
  },
})
