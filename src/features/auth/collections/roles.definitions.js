/**
 * @file auth/definitions/roles.definitions.js
 * @description Business roles and permission bundles for EduProLIC.
 */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

export default defineCollection({
  name: 'roles',
  shard: { type: 'none' },
  schema: {
    code: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true, filterable: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    description: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    permissions: { type: FIELD_TYPES.ARRAY, required: false },
    isSystem: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true },
  },
  writableFields: ['code', 'name', 'description', 'permissions', 'isSystem', 'status'],
  updateableFields: ['name', 'description', 'permissions', 'isSystem', 'status'],
  indexes: [
    { fields: ['code'] },
    { fields: ['status', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['code', 'name', 'description'],
  },
  rules: {
    read: 'auth',
    create: 'adminOnly',
    update: 'adminOnly',
    delete: 'adminOnly',
  },
});
