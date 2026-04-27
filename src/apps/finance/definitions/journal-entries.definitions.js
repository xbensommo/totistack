import { FIELD_TYPES, defineCollection } from '@xbensommo/shard-provider'

/**
 * Immutable ledger entries created by posting transactions.
 */
const financeJournalEntries = defineCollection({
  name: 'finance_journal_entries',
  shard: { type: 'none' },
  schema: {
    transactionId: { type: FIELD_TYPES.STRING, required: true, filterable: true },
    transactionType: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    status: {
      type: FIELD_TYPES.STRING,
      required: true,
      filterable: true,
      sortable: true,
      enum: ['posted', 'reversal'],
    },
    memo: { type: FIELD_TYPES.STRING, required: false, searchable: true },
    currency: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    postedAt: { type: FIELD_TYPES.TIMESTAMP, required: true, sortable: true, filterable: true },
    periodKey: { type: FIELD_TYPES.STRING, required: true, filterable: true, sortable: true },
    lines: { type: FIELD_TYPES.ARRAY, required: true },
    totalDebit: { type: FIELD_TYPES.NUMBER, required: true, sortable: true },
    totalCredit: { type: FIELD_TYPES.NUMBER, required: true, sortable: true },
    reversalOfEntryId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    reversedEntryId: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdBy: { type: FIELD_TYPES.STRING, required: false, filterable: true },
    createdAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true, filterable: true },
    updatedAt: { type: FIELD_TYPES.TIMESTAMP, readonly: true, sortable: true },
  },
  writableFields: [
    'transactionId',
    'transactionType',
    'status',
    'memo',
    'currency',
    'postedAt',
    'periodKey',
    'lines',
    'totalDebit',
    'totalCredit',
    'reversalOfEntryId',
    'reversedEntryId',
    'createdBy',
    'createdAt',
    'updatedAt',
  ],
  updateableFields: [
    'reversedEntryId',
    'updatedAt',
  ],
  indexes: [
    { fields: ['transactionId'] },
    { fields: ['periodKey', 'status', 'postedAt'] },
    { fields: ['transactionType', 'postedAt'] },
  ],
  search: {
    mode: 'token-array',
    fields: ['memo', 'periodKey', 'transactionId'],
  },
})

export default financeJournalEntries
