import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';


/**
 * Password reset tokens collection definition
 */
const passwordResetTokensCollection = defineCollection({
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
  passwordResetTokens: passwordResetTokensCollection
};