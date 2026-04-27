/**
 * @file src/apps/finance/services/createFinanceRepositories.js
 * @description Direct root-store finance repository bindings.
 */

import { FinanceRuntimeError } from './financeErrors.js'

export const FINANCE_COLLECTIONS = Object.freeze({
  accounts: 'finance_accounts',
  transactions: 'finance_transactions',
  journalEntries: 'finance_journal_entries',
  periods: 'finance_periods',
})

function readItems(state, actions) {
  const value = state?.items || state?.value?.items || state?.value || state || actions?.state?.items || actions?.items
  return Array.isArray(value) ? value : []
}

function resolveCollectionActions(store, explicitActions, collectionName) {
  const actionKey = `${collectionName}Actions`
  const actions = explicitActions?.[collectionName] || explicitActions?.[actionKey] || store?.[actionKey] || null

  if (!actions) {
    throw new FinanceRuntimeError(`[finance] Missing root-store shard actions: store.${actionKey}`, {
      code: 'FINANCE_COLLECTION_ACTIONS_MISSING',
      meta: { collectionName, actionKey },
    })
  }

  return actions
}

function resolveCollectionState(store, explicitStates, collectionName, actions) {
  return explicitStates?.[collectionName] || store?.[collectionName] || actions?.state || null
}

function requireMethod(actions, methodName, collectionName) {
  if (typeof actions?.[methodName] !== 'function') {
    throw new FinanceRuntimeError(`[finance] Missing shard action method: ${collectionName}Actions.${methodName}`, {
      code: 'FINANCE_REPOSITORY_METHOD_MISSING',
      meta: { collectionName, methodName },
    })
  }

  return actions[methodName].bind(actions)
}

function createRepository(collectionName, actions, state) {
  return {
    collectionName,
    actions,
    state,

    async fetchList(options = {}) {
      await requireMethod(actions, 'fetchInitialPage', collectionName)(options)
      return this.getItems()
    },

    getItems() {
      return readItems(state, actions)
    },

    async getById(id) {
      return requireMethod(actions, 'getById', collectionName)(id)
    },

    async add(record) {
      return requireMethod(actions, 'add', collectionName)(record)
    },

    async update(id, patch) {
      return requireMethod(actions, 'update', collectionName)(id, patch)
    },

    async remove(id) {
      return requireMethod(actions, 'remove', collectionName)(id)
    },
  }
}

export function createFinanceRepositories(options = {}) {
  const store = options.store || null
  const explicitActions = options.actions || {}
  const explicitStates = options.states || {}

  const accountsActions = resolveCollectionActions(store, explicitActions, FINANCE_COLLECTIONS.accounts)
  const transactionsActions = resolveCollectionActions(store, explicitActions, FINANCE_COLLECTIONS.transactions)
  const journalEntriesActions = resolveCollectionActions(store, explicitActions, FINANCE_COLLECTIONS.journalEntries)
  const periodsActions = resolveCollectionActions(store, explicitActions, FINANCE_COLLECTIONS.periods)

  return {
    accounts: createRepository(
      FINANCE_COLLECTIONS.accounts,
      accountsActions,
      resolveCollectionState(store, explicitStates, FINANCE_COLLECTIONS.accounts, accountsActions),
    ),
    transactions: createRepository(
      FINANCE_COLLECTIONS.transactions,
      transactionsActions,
      resolveCollectionState(store, explicitStates, FINANCE_COLLECTIONS.transactions, transactionsActions),
    ),
    journalEntries: createRepository(
      FINANCE_COLLECTIONS.journalEntries,
      journalEntriesActions,
      resolveCollectionState(store, explicitStates, FINANCE_COLLECTIONS.journalEntries, journalEntriesActions),
    ),
    periods: createRepository(
      FINANCE_COLLECTIONS.periods,
      periodsActions,
      resolveCollectionState(store, explicitStates, FINANCE_COLLECTIONS.periods, periodsActions),
    ),
  }
}
