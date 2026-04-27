/**
 * @file auth/collections/user_invites.definitions.js
 * @description Staff invitation workflow with hashed token storage and explicit authorization scope.
 */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export default defineCollection({
  name: 'user_invites',
  shard: { type: 'none' },
  schema: {
    email: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    firstName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    lastName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    displayName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    department: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    jobTitle: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    role: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    roles: { type: FIELD_TYPES.ARRAY, required: true },
    permissionKeys: { type: FIELD_TYPES.ARRAY, required: false },
    directPermissionKeys: { type: FIELD_TYPES.ARRAY, required: false },
    deniedPermissionKeys: { type: FIELD_TYPES.ARRAY, required: false },
    maxRoleLevel: { type: FIELD_TYPES.NUMBER, required: false, filterable: true, sortable: true },
    requiresMfa: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    requiresApproval: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    approvedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    approvedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    tokenHash: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    inviteUrl: { type: FIELD_TYPES.STRING, required: false },
    note: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    policySnapshot: { type: MAP, required: false },
    expiresAt: { type: FIELD_TYPES.TIMESTAMP, required: true, filterable: true, sortable: true },
    acceptedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    acceptedByUid: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    acceptedEmail: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    invitedBy: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    invitedByName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    revokedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    revokedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    revokeReason: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: [
    'email', 'firstName', 'lastName', 'displayName', 'department', 'jobTitle', 'role', 'roles', 'permissionKeys',
    'directPermissionKeys', 'deniedPermissionKeys', 'maxRoleLevel', 'requiresMfa', 'requiresApproval', 'approvedAt',
    'approvedBy', 'status', 'tokenHash', 'inviteUrl', 'note', 'policySnapshot', 'expiresAt', 'acceptedAt',
    'acceptedByUid', 'acceptedEmail', 'invitedBy', 'invitedByName', 'revokedAt', 'revokedBy', 'revokeReason', 'isDeleted',
  ],
  updateableFields: [
    'firstName', 'lastName', 'displayName', 'department', 'jobTitle', 'role', 'roles', 'permissionKeys',
    'directPermissionKeys', 'deniedPermissionKeys', 'maxRoleLevel', 'requiresMfa', 'requiresApproval', 'approvedAt',
    'approvedBy', 'status', 'inviteUrl', 'note', 'policySnapshot', 'expiresAt', 'acceptedAt', 'acceptedByUid',
    'acceptedEmail', 'invitedByName', 'revokedAt', 'revokedBy', 'revokeReason', 'isDeleted',
  ],
  indexes: [
    { fields: ['email'] },
    { fields: ['status', 'expiresAt'] },
    { fields: ['tokenHash'] },
    { fields: ['invitedBy', 'createdAt'] },
    { fields: ['approvedBy', 'approvedAt'] },
    { fields: ['acceptedByUid', 'acceptedAt'] },
    { fields: ['role', 'status'] },
    { fields: ['isDeleted', 'createdAt'] },
  ],
  search: { mode: 'token-array', fields: ['email', 'firstName', 'lastName', 'displayName', 'role', 'department', 'jobTitle', 'note'] },
  rules: {
    read: 'permission:auth.invites.view',
    create: 'serverOnly',
    update: 'serverOnly',
    delete: 'serverOnly',
  },
})
