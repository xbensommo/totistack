/**
 * @file apps/crm/collections/crm_assignment_rules.definitions.js
 * @description Team assignment and ownership rules for new CRM records.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'crm_assignment_rules',
  shard: { type: 'none' },
  schema: {
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    targetModule: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    enabled: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    ownershipMode: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    assignTo: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    assignTeam: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    roundRobinKey: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    conditions: { type: FIELD_TYPES.ARRAY, required: false },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'name', 'targetModule', 'enabled', 'ownershipMode', 'assignTo', 'assignTeam',
    'roundRobinKey', 'conditions', 'createdBy',
  ],
  updateableFields: [
    'name', 'targetModule', 'enabled', 'ownershipMode', 'assignTo', 'assignTeam',
    'roundRobinKey', 'conditions',
  ],
  indexes: [
    { fields: ['targetModule', 'enabled'] },
    { fields: ['assignTeam', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['name', 'targetModule', 'assignTo', 'assignTeam'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOnly',
  },
});
