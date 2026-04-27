/**
 * @file auth/collections/sessions.definitions.js
 * @description Optional session evidence. Store hashes/metadata, not raw secrets.
 */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

const MAP = FIELD_TYPES.MAP || FIELD_TYPES.OBJECT

export default defineCollection({
  name: 'sessions',
  shard: { type: 'none' },
  schema: {
    userId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    email: { type: FIELD_TYPES.STRING, required: false, searchable: true, filterable: true },
    provider: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    isActive: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    authTime: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    lastSeenAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    expiresAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    revokedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, filterable: true, sortable: true },
    revokedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    revokeReason: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    ipHash: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    userAgentHash: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    deviceFingerprintHash: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    mfaVerified: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    riskScore: { type: FIELD_TYPES.NUMBER, required: false, filterable: true, sortable: true },
    metadata: { type: MAP, required: false },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: [
    'userId', 'email', 'provider', 'status', 'isActive', 'authTime', 'lastSeenAt', 'expiresAt', 'revokedAt',
    'revokedBy', 'revokeReason', 'ipHash', 'userAgentHash', 'deviceFingerprintHash', 'mfaVerified', 'riskScore',
    'metadata', 'isDeleted',
  ],
  updateableFields: [
    'status', 'isActive', 'lastSeenAt', 'expiresAt', 'revokedAt', 'revokedBy', 'revokeReason', 'riskScore', 'metadata', 'isDeleted',
  ],
  indexes: [
    { fields: ['userId', 'createdAt'] },
    { fields: ['userId', 'status'] },
    { fields: ['status', 'lastSeenAt'] },
    { fields: ['expiresAt', 'status'] },
    { fields: ['revokedBy', 'revokedAt'] },
    { fields: ['isDeleted', 'createdAt'] },
  ],
  rules: {
    read: 'ownOrPermission:auth.sessions.view',
    create: 'serverOnly',
    update: 'serverOnly',
    delete: 'serverOnly',
  },
})
