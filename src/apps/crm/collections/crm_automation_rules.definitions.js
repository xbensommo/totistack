/**
 * @file apps/crm/collections/crm_automation_rules.definitions.js
 * @description Workflow automation rules for CRM follow-up and notifications.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'crm_automation_rules',
  shard: { type: 'none' },
  schema: {
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    targetModule: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    triggerEvent: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    enabled: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    conditions: { type: FIELD_TYPES.ARRAY, required: false },
    actions: { type: FIELD_TYPES.ARRAY, required: false },
    owner: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    team: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    runCount: { type: FIELD_TYPES.NUMBER, required: false, sortable: true },
    lastRunAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'name', 'targetModule', 'triggerEvent', 'enabled', 'conditions', 'actions', 'owner', 'team',
    'runCount', 'lastRunAt', 'createdBy',
  ],
  updateableFields: [
    'name', 'targetModule', 'triggerEvent', 'enabled', 'conditions', 'actions', 'owner', 'team',
    'runCount', 'lastRunAt',
  ],
  indexes: [
    { fields: ['targetModule', 'enabled'] },
    { fields: ['owner', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['name', 'triggerEvent', 'targetModule'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOnly',
  },
});
