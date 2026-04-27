import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

/**
 * Finance chart of accounts definition.
 */
export default  defineCollection({
  name: 'finance_accounts',
  shard: { type: 'none' },
  schema: {
    code: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    name: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    type: {
      type: FIELD_TYPES.STRING,
      required: true,
      filterable: true,
      sortable: true,
      enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    },
    normalSide: {
      type: FIELD_TYPES.STRING,
      required: true,
      filterable: true,
      enum: ['debit', 'credit'],
    },
    parentAccountId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    currency: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    description: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    isSystem: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true },
    isActive: { type: FIELD_TYPES.BOOLEAN, required: false, filterable: true, sortable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    updatedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
  },
  writableFields: [
    'code',
    'name',
    'type',
    'normalSide',
    'parentAccountId',
    'currency',
    'description',
    'isSystem',
    'isActive',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
  ],
  updateableFields: [
    'name',
    'type',
    'normalSide',
    'parentAccountId',
    'currency',
    'description',
    'isSystem',
    'isActive',
    'updatedBy',
    'createdAt',
    'updatedAt',
  ],
  indexes: [
    { fields: ['code'] },
    { fields: ['type', 'isActive', 'createdAt'] },
    { fields: ['parentAccountId', 'createdAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['code', 'name', 'description'],
  },
})


