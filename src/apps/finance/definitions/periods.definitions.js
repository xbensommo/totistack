import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

/**
 * Accounting periods and close controls.
 */
const financePeriods = defineCollection({
  name: 'finance_periods',
  shard: { type: 'none' },
  schema: {
    key: { type: FIELD_TYPES.STRING, required: true, searchable: true, filterable: true, sortable: true },
    label: { type: FIELD_TYPES.STRING, required: true, searchable: true, sortable: true },
    startsOn: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true, filterable: true },
    endsOn: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true, filterable: true },
    status: {
      type: FIELD_TYPES.STRING,
      required: true,
      filterable: true,
      sortable: true,
      enum: ['open', 'closed'],
    },
    closedAt: { type: FIELD_TYPES.TIMESTAMP, required: false, sortable: true },
    closedBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
  },
  writableFields: [
    'key',
    'label',
    'startsOn',
    'endsOn',
    'status',
    'closedAt',
    'closedBy',
    'createdAt',
    'updatedAt',
  ],
  updateableFields: [
    'label',
    'startsOn',
    'endsOn',
    'status',
    'closedAt',
    'closedBy',
    'createdAt',
    'updatedAt',
  ],
  indexes: [
    { fields: ['key'] },
    { fields: ['status', 'endsOn'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['key', 'label'],
  },
})

export default financePeriods
