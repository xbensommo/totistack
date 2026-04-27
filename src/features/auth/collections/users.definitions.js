/**
 * @file auth/collections/users.definitions.js
 * @description User access profiles. Firebase Auth remains the identity provider; this collection stores authorization metadata.
 *
 * Security rule: browser writes are limited to non-security profile fields. Role, permission,
 * status, MFA, session, and access-version fields are server-owned and must be changed only
 * through Cloud Functions / server actions.
 */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export const USER_PUBLIC_CREATE_FIELDS = Object.freeze([
  'uid', 'email', 'displayName', 'firstName', 'lastName', 'phoneNumber', 'photoURL', 'termsAcceptedAt', 'isDeleted',
])

export const USER_PROFILE_UPDATE_FIELDS = Object.freeze([
  'displayName', 'firstName', 'lastName', 'phoneNumber', 'photoURL', 'termsAcceptedAt',
])

export const USER_SERVER_ONLY_FIELDS = Object.freeze([
  'role', 'roles', 'permissions', 'permissionKeys', 'directPermissionKeys', 'deniedPermissionKeys',
  'accessVersion', 'lastAccessChangedAt', 'lastAccessChangedBy', 'lastAccessReviewAt', 'accessReviewedBy',
  'status', 'emailVerified', 'mfaEnrolled', 'mfaRequired', 'riskLevel', 'lockedUntil',
  'employeeCode', 'department', 'jobTitle', 'managerUid', 'isAvailableForAssignments', 'commissionProfileId', 'inviteId',
  'suspendedAt', 'suspendedBy', 'suspensionReason', 'deactivatedAt', 'deactivatedBy', 'restoredAt', 'restoredBy',
  'sessionsRevokedAt', 'sessionsRevokedBy', 'lastLoginAt', 'lastPasswordChangeAt', 'joinedAt', 'archivedAt',
  'claimsSyncedAt', 'claimsSchemaVersion', 'claimsAccessVersion', 'securityMetadata',
])

export default defineCollection({
  name: 'users',
  shard: { type: 'none' },
  schema: {
    uid: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    email: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    displayName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    firstName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    lastName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    phoneNumber: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    photoURL: { type: FIELD_TYPES.STRING, required: false },

    role: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true, readonly: true },
    roles: { type: FIELD_TYPES.ARRAY, required: true, readonly: true },
    permissions: { type: FIELD_TYPES.ARRAY, required: false, readonly: true },
    permissionKeys: { type: FIELD_TYPES.ARRAY, required: false, readonly: true },
    directPermissionKeys: { type: FIELD_TYPES.ARRAY, required: false, readonly: true },
    deniedPermissionKeys: { type: FIELD_TYPES.ARRAY, required: false, readonly: true },
    accessVersion: { type: FIELD_TYPES.NUMBER, required: false, filterable: true, sortable: true, readonly: true },
    lastAccessChangedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    lastAccessChangedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },
    lastAccessReviewAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    accessReviewedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },

    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true, readonly: true },
    emailVerified: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true, readonly: true },
    mfaEnrolled: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true, readonly: true },
    mfaRequired: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true, readonly: true },
    riskLevel: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true, readonly: true },
    lockedUntil: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },

    employeeCode: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true, readonly: true },
    department: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },
    jobTitle: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true, readonly: true },
    managerUid: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },
    isAvailableForAssignments: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true, readonly: true },
    commissionProfileId: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },
    inviteId: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },

    suspendedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    suspendedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },
    suspensionReason: { type: FIELD_TYPES.STRING, required: false, searchable: true, readonly: true },
    restoredAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    restoredBy: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },
    deactivatedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    deactivatedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },
    sessionsRevokedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    sessionsRevokedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true, readonly: true },
    lastLoginAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    lastPasswordChangeAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    termsAcceptedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    joinedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    archivedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },

    claimsSyncedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true, readonly: true },
    claimsSchemaVersion: { type: FIELD_TYPES.NUMBER, required: false, filterable: true, sortable: true, readonly: true },
    claimsAccessVersion: { type: FIELD_TYPES.NUMBER, required: false, filterable: true, sortable: true, readonly: true },
    securityMetadata: { type: MAP, required: false, readonly: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: [...USER_PUBLIC_CREATE_FIELDS],
  updateableFields: [...USER_PROFILE_UPDATE_FIELDS],
  serverOnlyFields: [...USER_SERVER_ONLY_FIELDS],
  indexes: [
    { fields: ['email'] },
    { fields: ['uid'] },
    { fields: ['role', 'status'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['department', 'status'] },
    { fields: ['managerUid', 'status'] },
    { fields: ['inviteId'] },
    { fields: ['mfaRequired', 'mfaEnrolled'] },
    { fields: ['riskLevel', 'status'] },
    { fields: ['lastAccessReviewAt', 'status'] },
    { fields: ['suspendedBy', 'suspendedAt'] },
    { fields: ['claimsAccessVersion', 'accessVersion'] },
    { fields: ['isDeleted', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['email', 'displayName', 'firstName', 'lastName', 'phoneNumber', 'employeeCode', 'jobTitle', 'suspensionReason'],
  },
  rules: {
    read: 'ownOrPermission:auth.users.view',
    create: 'serverOnly',
    update: 'ownProfileOnlyOrServerAction',
    delete: 'serverOnly',
  },
})
