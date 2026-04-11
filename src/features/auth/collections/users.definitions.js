import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider';

/**
 * User profile collection used by the shared auth runtime.
 */
const users = defineCollection({
  name: 'users',
  shard: { type: 'none' },
  schema: {
    email: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true },
    displayName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    firstName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    lastName: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    phoneNumber: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    photoURL: { type: FIELD_TYPES.STRING, required: false },
    role: { type: FIELD_TYPES.STRING, required: false, filterable: true, sortable: true },
    roles: { type: FIELD_TYPES.ARRAY, required: false },
    permissions: { type: FIELD_TYPES.ARRAY, required: false },
    status: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    emailVerified: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    lastLoginAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true },
  },
  writableFields: [
    'email',
    'displayName',
    'firstName',
    'lastName',
    'phoneNumber',
    'photoURL',
    'role',
    'roles',
    'permissions',
    'status',
    'emailVerified',
    'lastLoginAt',
    'createdAt',
    'updatedAt',
  ],
  updateableFields: [
    'displayName',
    'firstName',
    'lastName',
    'phoneNumber',
    'photoURL',
    'role',
    'roles',
    'permissions',
    'status',
    'emailVerified',
    'lastLoginAt',
    'createdAt',
    'updatedAt',
  ],
  indexes: [
    { fields: ['email'] },
    { fields: ['role', 'createdAt'] },
    { fields: ['status', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['email', 'displayName', 'firstName', 'lastName'],
  },
});

export default users;
