/**
 * @file auth/collections/password-reset-tokens.definitions.js
 * @description Server-side password reset evidence. Prefer Firebase Auth reset links; never store raw tokens.
 */

import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

export default defineCollection({
  name: 'password_reset_tokens',
  shard: { type: 'none' },
  schema: {
    userId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    email: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    tokenHash: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    status: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    used: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    requestedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    usedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true, filterable: true },
    expiresAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, system: true, sortable: true, filterable: true },
    isDeleted: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
  },
  writableFields: ['userId', 'email', 'tokenHash', 'status', 'used', 'requestedBy', 'usedAt', 'expiresAt', 'isDeleted'],
  updateableFields: ['status', 'used', 'usedAt', 'isDeleted'],
  indexes: [
    { fields: ['tokenHash'] },
    { fields: ['userId', 'status'] },
    { fields: ['email', 'createdAt'] },
    { fields: ['expiresAt', 'status'] },
    { fields: ['isDeleted', 'createdAt'] },
  ],
  rules: {
    read: 'serverOnly',
    create: 'serverOnly',
    update: 'serverOnly',
    delete: 'serverOnly',
  },
})
