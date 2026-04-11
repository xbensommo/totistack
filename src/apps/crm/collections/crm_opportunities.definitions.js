/**
 * @file crm/collections/crm_opportunities.definitions.js
 * @description Opportunity collection definition aligned to shard-provider and generated assembly.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider'

export default defineCollection({
  name: 'crm_opportunities',
  shard: { type: 'none' },
  schema: {
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    opportunityNumber: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true, filterable: true },
    leadId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    contactId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    accountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    amount: { type: FIELD_TYPES.NUMBER, required: true, sortable: true, filterable: true },
    currency: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    probability: { type: FIELD_TYPES.NUMBER, required: false, sortable: true, filterable: true },
    expectedCloseDate: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true, filterable: true },
    actualCloseDate: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    stage: {
      type: FIELD_TYPES.STRING,
      required: true,
      enum: ['prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
      filterable: true,
      sortable: true,
    },
    stageHistory: { type: FIELD_TYPES.ARRAY, required: false },
    forecastCategory: {
      type: FIELD_TYPES.STRING,
      required: false,
      enum: ['commit', 'best_case', 'pipeline', 'omitted'],
      filterable: true,
    },
    weightedAmount: { type: FIELD_TYPES.NUMBER, required: false, sortable: true, filterable: true },
    lineItems: { type: FIELD_TYPES.ARRAY, required: false },
    competitors: { type: FIELD_TYPES.ARRAY, required: false },
    decisionCriteria: { type: FIELD_TYPES.STRING, required: false },
    nextSteps: { type: FIELD_TYPES.STRING, required: false },
    winLossReason: { type: FIELD_TYPES.STRING, required: false },
    owner: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    team: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    lastActivityAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    lastContactAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
    closedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
  },
  writableFields: [
    'name', 'opportunityNumber', 'leadId', 'contactId', 'accountId', 'amount', 'currency', 'probability',
    'expectedCloseDate', 'actualCloseDate', 'stage', 'stageHistory', 'forecastCategory', 'weightedAmount',
    'lineItems', 'competitors', 'decisionCriteria', 'nextSteps', 'winLossReason', 'owner', 'team',
    'lastActivityAt', 'lastContactAt', 'closedAt',
  ],
  updateableFields: [
    'name', 'contactId', 'accountId', 'amount', 'currency', 'probability', 'expectedCloseDate', 'actualCloseDate',
    'stage', 'stageHistory', 'forecastCategory', 'weightedAmount', 'lineItems', 'competitors',
    'decisionCriteria', 'nextSteps', 'winLossReason', 'owner', 'team', 'lastActivityAt', 'lastContactAt', 'closedAt',
  ],
  indexes: [
    { fields: ['opportunityNumber', 'createdAt'] },
    { fields: ['owner', 'stage'] },
    { fields: ['stage', 'expectedCloseDate'] },
    { fields: ['accountId', 'createdAt'] },
    { fields: ['amount', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['name', 'opportunityNumber', 'decisionCriteria', 'nextSteps', 'winLossReason'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOnly',
  },
})
