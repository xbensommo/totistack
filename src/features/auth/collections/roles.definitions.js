/**
 * @file auth/collections/roles.definitions.js
 * @description Role catalog. Roles are permission bundles; authorization must check permissions.
 */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export default defineCollection({
  name: 'roles',
  shard: { type: 'none' },
  schema: {
    code: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true, filterable: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    description: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    permissions: { type: FIELD_TYPES.ARRAY, required: true },
    inheritedRoles: { type: FIELD_TYPES.ARRAY, required: false },
    level: { type: FIELD_TYPES.NUMBER, required: true, sortable: true, filterable: true },
    isSystem: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    immutable: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    requiresMfa: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    assignmentPolicy: { type: MAP, required: false },
    separationOfDuties: { type: FIELD_TYPES.ARRAY, required: false },
    ownerDepartment: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    lastReviewedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    reviewedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    updatedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: [
    'code', 'name', 'description', 'permissions', 'inheritedRoles', 'level', 'isSystem', 'immutable', 'requiresMfa',
    'assignmentPolicy', 'separationOfDuties', 'ownerDepartment', 'status', 'lastReviewedAt', 'reviewedBy',
    'createdBy', 'updatedBy', 'isDeleted',
  ],
  updateableFields: [
    'name', 'description', 'permissions', 'inheritedRoles', 'level', 'immutable', 'requiresMfa',
    'assignmentPolicy', 'separationOfDuties', 'ownerDepartment', 'status', 'lastReviewedAt', 'reviewedBy',
    'updatedBy', 'isDeleted',
  ],
  indexes: [
    { fields: ['code'] },
    { fields: ['status', 'level'] },
    { fields: ['isSystem', 'status'] },
    { fields: ['requiresMfa', 'status'] },
    { fields: ['lastReviewedAt', 'status'] },
    { fields: ['isDeleted', 'createdAt'] },
  ],
  search: { mode: 'token-array', fields: ['code', 'name', 'description', 'ownerDepartment'] },
  rules: {
    read: 'permission:auth.roles.view',
    create: 'serverOnly',
    update: 'serverOnly',
    delete: 'serverOnly',
  },
})
