/**
 * @file apps/crm/collections/crm_saved_views.definitions.js
 * @description Saved search and filter presets for CRM modules.
 */

import { defineCollection, FIELD_TYPES } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'crm_saved_views',
  shard: { type: 'none' },
  schema: {
    module: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    query: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    filters: { type: FIELD_TYPES.OBJECT, required: false },
    sort: { type: FIELD_TYPES.OBJECT, required: false },
    visibility: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    isDefault: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    owner: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: [
    'module', 'name', 'query', 'filters', 'sort', 'visibility', 'isDefault', 'owner', 'createdBy',
  ],
  updateableFields: [
    'name', 'query', 'filters', 'sort', 'visibility', 'isDefault',
  ],
  indexes: [
    { fields: ['module', 'createdAt'] },
    { fields: ['owner', 'module'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['name', 'query'],
  },
  rules: {
    read: 'auth',
    create: 'auth',
    update: 'auth',
    delete: 'adminOrManager',
  },
});
