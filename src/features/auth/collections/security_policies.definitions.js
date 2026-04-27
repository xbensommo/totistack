/**
 * @file auth/collections/security_policies.definitions.js
 * @description Versioned security policy configuration and evidence snapshot.
 */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export default defineCollection({
  name: 'security_policies',
  shard: { type: 'none' },
  schema: {
    code: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    version: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    effectiveAt: { type: FIELD_TYPES.TIMESTAMP, required: true, filterable: true, sortable: true },
    retiredAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    mfaRequiredForRoles: { type: FIELD_TYPES.ARRAY, required: false },
    allowedEmailDomains: { type: FIELD_TYPES.ARRAY, required: false },
    allowPublicSignup: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    inviteOnly: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    defaultSignupRole: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    sessionTtlMinutes: { type: FIELD_TYPES.NUMBER, required: false, filterable: true, sortable: true },
    accessReviewCadenceDays: { type: FIELD_TYPES.NUMBER, required: false, filterable: true, sortable: true },
    privilegedAccessRequiresApproval: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    settings: { type: MAP, required: false },
    approvedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    approvedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: [
    'code', 'name', 'version', 'status', 'effectiveAt', 'retiredAt', 'mfaRequiredForRoles', 'allowedEmailDomains',
    'allowPublicSignup', 'inviteOnly', 'defaultSignupRole',
    'sessionTtlMinutes', 'accessReviewCadenceDays', 'privilegedAccessRequiresApproval', 'settings', 'approvedBy', 'approvedAt', 'isDeleted',
  ],
  updateableFields: [
    'name', 'version', 'status', 'effectiveAt', 'retiredAt', 'mfaRequiredForRoles', 'allowedEmailDomains',
    'allowPublicSignup', 'inviteOnly', 'defaultSignupRole',
    'sessionTtlMinutes', 'accessReviewCadenceDays', 'privilegedAccessRequiresApproval', 'settings', 'approvedBy', 'approvedAt', 'isDeleted',
  ],
  indexes: [
    { fields: ['code', 'version'] },
    { fields: ['status', 'effectiveAt'] },
    { fields: ['approvedBy', 'approvedAt'] },
    { fields: ['isDeleted', 'createdAt'] },
  ],
  rules: {
    read: 'permission:auth.securityPolicy.view',
    create: 'serverOnly',
    update: 'serverOnly',
    delete: 'serverOnly',
  },
})
