import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

/**
 * Users collection definition
 */
export const usersCollection = defineCollection({
  name: 'users',
  shard: { type: 'monthly', field: 'createdAt' },
  schema: {
    // Core fields
    email: { type: FIELD_TYPES.STRING, required: true, filterable: true, searchable: true },
    name: { type: FIELD_TYPES.STRING, required: true, filterable: true, searchable: true },
    displayName: { type: FIELD_TYPES.STRING, searchable: true },
    photoURL: { type: FIELD_TYPES.STRING },
    phoneNumber: { type: FIELD_TYPES.STRING, filterable: true },
    
    // Verification
    emailVerified: { type: FIELD_TYPES.BOOLEAN, filterable: true, default: false },
    phoneVerified: { type: FIELD_TYPES.BOOLEAN, filterable: true, default: false },
    
    // Status
    status: { 
      type: FIELD_TYPES.STRING, 
      enum: ['active', 'inactive', 'suspended', 'pending'], 
      filterable: true, 
      default: 'pending' 
    },
    
    // Roles
    roles: { type: FIELD_TYPES.ARRAY, filterable: true, default: ['user'] },
    
    // Security
    lastLoginAt: { type: FIELD_TYPES.TIMESTAMP, sortable: true },
    lastLoginIP: { type: FIELD_TYPES.STRING },
    loginAttempts: { type: FIELD_TYPES.NUMBER, default: 0 },
    lockedUntil: { type: FIELD_TYPES.TIMESTAMP },
    
    // Timestamps
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
    createdBy: { type: FIELD_TYPES.STRING, readonly: true, filterable: true },
    
    // Preferences
    preferences: { type: FIELD_TYPES.OBJECT, default: {} },
    metadata: { type: FIELD_TYPES.OBJECT, default: {} }
  },
  writableFields: ['name', 'displayName', 'photoURL', 'phoneNumber', 'preferences', 'metadata'],
  updateableFields: ['name', 'displayName', 'photoURL', 'phoneNumber', 'preferences', 'metadata', 'status'],
  indexes: [
    { fields: ['email'] },
    { fields: ['status', 'createdAt'] },
    { fields: ['roles', 'status'] },
    { fields: ['emailVerified', 'status'] }
  ],
  search: { mode: 'token-array', fields: ['name', 'email', 'displayName'] }
});

/**
 * Sessions collection definition
 */
export const sessionsCollection = defineCollection({
  name: 'sessions',
  shard: { type: 'daily', field: 'createdAt' },
  schema: {
    userId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    sessionToken: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    refreshToken: { type: FIELD_TYPES.STRING },
    userAgent: { type: FIELD_TYPES.STRING },
    ipAddress: { type: FIELD_TYPES.STRING },
    deviceInfo: { type: FIELD_TYPES.OBJECT },
    expiresAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
    lastActivityAt: { type: FIELD_TYPES.TIMESTAMP, sortable: true },
    isActive: { type: FIELD_TYPES.BOOLEAN, filterable: true, default: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true }
  },
  writableFields: ['lastActivityAt', 'isActive'],
  updateableFields: ['lastActivityAt', 'isActive'],
  indexes: [
    { fields: ['userId', 'isActive'] },
    { fields: ['sessionToken'] },
    { fields: ['expiresAt'] }
  ]
});

/**
 * Password reset tokens collection definition
 */
export const passwordResetTokensCollection = defineCollection({
  name: 'password-reset-tokens',
  shard: { type: 'daily', field: 'createdAt' },
  schema: {
    userId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    token: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    email: { type: FIELD_TYPES.STRING, required: true },
    used: { type: FIELD_TYPES.BOOLEAN, default: false, filterable: true },
    expiresAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true }
  },
  writableFields: ['used'],
  updateableFields: ['used'],
  indexes: [
    { fields: ['token'] },
    { fields: ['userId', 'used'] },
    { fields: ['expiresAt'] }
  ]
});

export default {
  users: usersCollection,
  sessions: sessionsCollection,
  passwordResetTokens: passwordResetTokensCollection
};