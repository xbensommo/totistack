import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

/**
 * Optional session tracking collection for auth analytics and audits.
 */
const sessions = defineCollection({
  name: 'sessions',
  shard: { type: 'none', field: 'createdAt' },
  schema: {
    user_id : { type: FIELD_TYPES.STRING, required: true, filterable: true },
    userAgent: { type: FIELD_TYPES.STRING, required: false },
    provider: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    isActive: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
  },
  writableFields: ['user_id ', 'userAgent', 'provider', 'isActive', 'lastActivityAt', 'isActive','createdAt', 'updatedAt'],
  updateableFields: ['userAgent', 'provider', 'isActive', 'updatedAt','lastActivityAt', 'isActive'],
  indexes: [{ fields: ['user_id ', 'createdAt'] }],
});

export default sessions;
