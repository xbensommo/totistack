import test from 'node:test'
import assert from 'node:assert/strict'
import { createFinanceCommandBus } from '../services/createFinanceCommandBus.js'

function createMemoryRepository(initialItems = []) {
  const items = new Map(initialItems.map((item) => [item.id, structuredClone(item)]))

  return {
    async getById(id) {
      return items.get(id) ? structuredClone(items.get(id)) : null
    },
    async add(record) {
      items.set(record.id, structuredClone(record))
      return structuredClone(record)
    },
    async update(id, patch) {
      const current = items.get(id)
      items.set(id, { ...current, ...structuredClone(patch) })
      return structuredClone(items.get(id))
    },
    async remove(id) {
      items.delete(id)
      return true
    },
    async fetchList() {
      return this.snapshot()
    },
    getItems() {
      return [...items.values()].map((item) => structuredClone(item))
    },
    snapshot() {
      return [...items.values()].map((item) => structuredClone(item))
    },
  }
}

function openPeriods() {
  return createMemoryRepository([
    {
      id: 'period_2026_03',
      key: '2026-03',
      label: 'March 2026',
      status: 'open',
      startsOn: '2026-03-01',
      endsOn: '2026-03-31',
    },
    {
      id: 'period_2026_04',
      key: '2026-04',
      label: 'April 2026',
      status: 'open',
      startsOn: '2026-04-01',
      endsOn: '2026-04-30',
    },
  ])
}

test('reviewTransaction promotes a draft transaction to reviewed', async () => {
  const transactions = createMemoryRepository([
    {
      id: 'txn_review',
      status: 'draft',
      type: 'payment',
      amount: 100,
      occurredOn: '2026-03-01',
    },
  ])

  const journalEntries = createMemoryRepository()
  const commandBus = createFinanceCommandBus({
    repositories: { transactions, journalEntries, periods: openPeriods() },
    confirm: async () => true,
    getCurrentUser: () => ({ id: 'user_1', roles: ['accountant'] }),
  })

  const result = await commandBus.reviewTransaction('txn_review')
  const record = transactions.snapshot()[0]

  assert.equal(result.status, 'reviewed')
  assert.equal(record.status, 'reviewed')
})

test('postTransaction creates journal entry and updates transaction', async () => {
  const transactions = createMemoryRepository([
    {
      id: 'txn_post',
      status: 'reviewed',
      type: 'payment',
      amount: 500,
      occurredOn: '2026-03-02',
      memo: 'Test payment',
    },
  ])

  const journalEntries = createMemoryRepository()
  const commandBus = createFinanceCommandBus({
    repositories: { transactions, journalEntries, periods: openPeriods() },
    confirm: async () => true,
    getCurrentUser: () => ({ id: 'user_1', roles: ['accountant'] }),
  })

  const result = await commandBus.postTransaction('txn_post')
  const transaction = transactions.snapshot()[0]
  const entries = journalEntries.snapshot()

  assert.equal(result.status, 'posted')
  assert.equal(transaction.status, 'posted')
  assert.equal(entries.length, 1)
  assert.equal(entries[0].transactionId, 'txn_post')
})

test('postTransaction fails when the accounting period is closed', async () => {
  const transactions = createMemoryRepository([
    {
      id: 'txn_closed',
      status: 'reviewed',
      type: 'payment',
      amount: 500,
      occurredOn: '2026-03-02',
      memo: 'Closed period payment',
    },
  ])

  const periods = createMemoryRepository([
    {
      id: 'period_2026_03',
      key: '2026-03',
      label: 'March 2026',
      status: 'closed',
      startsOn: '2026-03-01',
      endsOn: '2026-03-31',
    },
  ])

  const commandBus = createFinanceCommandBus({
    repositories: { transactions, journalEntries: createMemoryRepository(), periods },
    confirm: async () => true,
    getCurrentUser: () => ({ id: 'user_1', roles: ['accountant'] }),
  })

  await assert.rejects(() => commandBus.postTransaction('txn_closed'), /closed/i)
})

test('postTransaction blocks duplicate posting', async () => {
  const transactions = createMemoryRepository([
    {
      id: 'txn_dupe',
      status: 'reviewed',
      type: 'payment',
      amount: 500,
      occurredOn: '2026-03-02',
      postedJournalEntryId: 'je_existing',
    },
  ])

  const commandBus = createFinanceCommandBus({
    repositories: { transactions, journalEntries: createMemoryRepository(), periods: openPeriods() },
    confirm: async () => true,
    getCurrentUser: () => ({ id: 'user_1', roles: ['accountant'] }),
  })

  await assert.rejects(() => commandBus.postTransaction('txn_dupe'), /already been posted/i)
})

test('reverseJournalEntry blocks second reversal', async () => {
  const journalEntries = createMemoryRepository([
    {
      id: 'je_001',
      transactionId: 'txn_001',
      transactionType: 'payment',
      status: 'posted',
      postedAt: '2026-03-03T12:00:00.000Z',
      totalDebit: 100,
      totalCredit: 100,
      reversedEntryId: 'je_002',
      lines: [
        { accountId: 'cash', side: 'debit', amount: 100, memo: 'x' },
        { accountId: 'service_revenue', side: 'credit', amount: 100, memo: 'x' },
      ],
    },
  ])

  const commandBus = createFinanceCommandBus({
    repositories: { transactions: createMemoryRepository(), journalEntries, periods: openPeriods() },
    confirm: async () => true,
    getCurrentUser: () => ({ id: 'user_1', roles: ['accountant'] }),
  })

  await assert.rejects(() => commandBus.reverseJournalEntry('je_001'), /already been reversed/i)
})

test('closePeriod blocks when draft or reviewed transactions still exist in the period', async () => {
  const periods = createMemoryRepository([
    {
      id: 'period_2026_03',
      key: '2026-03',
      label: 'March 2026',
      status: 'open',
      startsOn: '2026-03-01',
      endsOn: '2026-03-31',
    },
  ])
  const transactions = createMemoryRepository([
    {
      id: 'txn_001',
      status: 'draft',
      type: 'expense',
      amount: 200,
      occurredOn: '2026-03-10',
    },
  ])

  const commandBus = createFinanceCommandBus({
    repositories: { transactions, journalEntries: createMemoryRepository(), periods },
    confirm: async () => true,
    getCurrentUser: () => ({ id: 'user_1', roles: ['accountant'] }),
  })

  await assert.rejects(() => commandBus.closePeriod('period_2026_03'), /pending/i)
})
