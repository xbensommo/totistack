import test from 'node:test'
import assert from 'node:assert/strict'
import { createFinanceCommandBus } from '../services/createFinanceCommandBus.js'

function createRepo(initial = []) {
  const state = new Map(initial.map((item) => [item.id, { ...item }]))
  return {
    async getById(id) { return state.get(id) || null },
    async update(id, patch) {
      const current = state.get(id)
      state.set(id, { ...current, ...patch })
      return state.get(id)
    },
    async add(item) { state.set(item.id, { ...item }); return item },
    async remove(id) { state.delete(id) },
    async fetchAll() { return [...state.values()] },
  }
}

test('reviewTransaction emits notification hook', async () => {
  const events = []
  const repositories = {
    transactions: createRepo([{ id: 'txn_1', status: 'draft', occurredOn: '2026-04-01', description: 'Test txn' }]),
    journalEntries: createRepo([]),
    periods: createRepo([{ id: 'period_1', key: '2026-04', status: 'open' }]),
  }

  const bus = createFinanceCommandBus({
    repositories,
    confirm: async () => true,
    getCurrentUser: () => ({ id: 'user_1', roles: ['accountant'] }),
    notifications: {
      async transactionReviewed(transaction) {
        events.push(['reviewed', transaction.id, transaction.status])
      },
    },
  })

  const result = await bus.reviewTransaction('txn_1')
  assert.equal(result.status, 'reviewed')
  assert.deepEqual(events, [['reviewed', 'txn_1', 'reviewed']])
})
