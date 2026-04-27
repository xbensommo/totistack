/**
 * @file src/apps/finance/stores/useFinanceAppStore.js
 * @description Runtime-backed finance workspace store for pages and components.
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { canFinance, FINANCE_ACTIONS } from '../permissions/finance.permissions.js'
import { createFinanceModule } from '../services/createFinanceModule.js'
import { normalizeFinanceError, FinanceRuntimeError } from '../services/financeErrors.js'
import { getFinanceRuntime } from '../services/financeRuntime.js'
import { buildFinanceDemoState } from '../services/financeSampleData.js'
import {
  buildBalanceSheet,
  buildBalanceSnapshot,
  buildExpenseStatement,
  buildIncomeStatement,
  buildTrialBalance,
} from '../services/financeReportService.js'

function sortByDateDesc(items, field) {
  return [...items].sort((a, b) => String(b?.[field] || '').localeCompare(String(a?.[field] || '')))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createRuntimeNotConfiguredError() {
  return new FinanceRuntimeError(
    'Finance runtime is not configured. Call configureFinanceRuntime({ store, getCurrentUser, confirm }) during app boot. Enable allowDemoMode only for isolated previews.',
    { code: 'FINANCE_RUNTIME_NOT_CONFIGURED' },
  )
}

export const useFinanceAppStore = defineStore('finance-app', () => {
  const initialized = ref(false)
  const runtimeMode = ref('uninitialized')
  const isLoading = ref(false)
  const error = ref(null)
  const moduleRef = ref(null)
  const accounts = ref([])
  const transactions = ref([])
  const journalEntries = ref([])
  const periods = ref([])
  const filters = ref({
    search: '',
    status: 'all',
    type: 'all',
  })

  const currentUser = computed(() => moduleRef.value?.getCurrentUser?.() || null)

  async function refreshCollection(repositoryName, targetRef) {
    const repository = moduleRef.value?.repositories?.[repositoryName]
    if (!repository) {
      targetRef.value = []
      return
    }

    await repository.fetchList?.()
    targetRef.value = clone(repository.getItems?.() || [])
  }

  async function refreshAll() {
    await Promise.all([
      refreshCollection('accounts', accounts),
      refreshCollection('transactions', transactions),
      refreshCollection('journalEntries', journalEntries),
      refreshCollection('periods', periods),
    ])
  }

  function seedDemoData(seedBuilder = buildFinanceDemoState) {
    const seed = seedBuilder()
    accounts.value = clone(seed.accounts)
    transactions.value = clone(seed.transactions)
    journalEntries.value = clone(seed.journalEntries)
    periods.value = clone(seed.periods)
    runtimeMode.value = 'demo'
    initialized.value = true
    error.value = null
  }

  async function initializeFromRuntime() {
    const runtime = getFinanceRuntime()

    if (runtime.repositories || runtime.store) {
      moduleRef.value = createFinanceModule({
        store: runtime.store || null,
        repositories: runtime.repositories || null,
        getCurrentUser: runtime.getCurrentUser || null,
        confirm: runtime.confirm || null,
      })
      await refreshAll()
      runtimeMode.value = 'runtime'
      initialized.value = true
      error.value = null
      return
    }

    if (runtime.allowDemoMode) {
      seedDemoData(runtime.seedBuilder || buildFinanceDemoState)
      return
    }

    throw createRuntimeNotConfiguredError()
  }

  async function ensureReady() {
    if (initialized.value || isLoading.value) return

    isLoading.value = true
    try {
      await initializeFromRuntime()
    } catch (caughtError) {
      const normalized = normalizeFinanceError(caughtError, {
        fallbackMessage: 'Failed to initialize finance workspace.',
        code: 'FINANCE_INIT_FAILED',
      })
      error.value = normalized
      throw normalized
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(nextFilters = {}) {
    filters.value = {
      ...filters.value,
      ...nextFilters,
    }
  }

  function can(action, record = null) {
    return canFinance(currentUser.value, action, record)
  }

  async function runCommand(name, ...args) {
    await ensureReady()

    if (!moduleRef.value?.commands?.[name]) {
      throw new FinanceRuntimeError(`Unknown finance command '${name}'.`, {
        code: 'FINANCE_COMMAND_MISSING',
        meta: { name },
      })
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await moduleRef.value.commands[name](...args)
      await refreshAll()
      return result
    } catch (caughtError) {
      const normalized = normalizeFinanceError(caughtError, {
        fallbackMessage: 'Finance command failed.',
        code: 'FINANCE_COMMAND_FAILED',
      })
      error.value = normalized
      throw normalized
    } finally {
      isLoading.value = false
    }
  }

  const filteredTransactions = computed(() => {
    const search = filters.value.search.trim().toLowerCase()

    return sortByDateDesc(transactions.value, 'occurredOn').filter((transaction) => {
      if (filters.value.status !== 'all' && transaction.status !== filters.value.status) return false
      if (filters.value.type !== 'all' && transaction.type !== filters.value.type) return false

      if (!search) return true

      const haystack = [
        transaction.reference,
        transaction.memo,
        transaction.clientLabel,
        transaction.consultantLabel,
        transaction.sourceRef,
        transaction.sourceType,
        transaction.sourceId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(search)
    })
  })

  const recentJournalEntries = computed(() => sortByDateDesc(journalEntries.value, 'postedAt').slice(0, 5))
  const openPeriods = computed(() => periods.value.filter((period) => period.status === 'open'))
  const closedPeriods = computed(() => periods.value.filter((period) => period.status === 'closed'))
  const trialBalance = computed(() => buildTrialBalance(journalEntries.value, accounts.value))
  const incomeStatement = computed(() => buildIncomeStatement(journalEntries.value, accounts.value))
  const balanceSheet = computed(() => buildBalanceSheet(journalEntries.value, accounts.value))
  const expenseStatement = computed(() => buildExpenseStatement(journalEntries.value, accounts.value))
  const balanceSnapshot = computed(() => buildBalanceSnapshot(journalEntries.value, accounts.value))

  const dashboardMetrics = computed(() => ({
    postedTransactions: transactions.value.filter((transaction) => transaction.status === 'posted').length,
    draftTransactions: transactions.value.filter((transaction) => transaction.status === 'draft').length,
    reviewedTransactions: transactions.value.filter((transaction) => transaction.status === 'reviewed').length,
    openPeriods: openPeriods.value.length,
    revenue: incomeStatement.value.revenue,
    expenses: incomeStatement.value.expenses,
    netIncome: incomeStatement.value.netIncome,
    assets: balanceSnapshot.value.assets,
  }))

  function canReviewTransaction(transaction) {
    return transaction?.status === 'draft' && can(FINANCE_ACTIONS.TRANSACTION_REVIEW, transaction)
  }

  function canPostTransaction(transaction) {
    return ['draft', 'reviewed'].includes(transaction?.status) && can(FINANCE_ACTIONS.TRANSACTION_POST, transaction)
  }

  function canReverseJournalEntry(entry) {
    return entry?.status === 'posted' && !entry?.reversedEntryId && can(FINANCE_ACTIONS.JOURNAL_REVERSE, entry)
  }

  async function reviewTransaction(transactionId) {
    return runCommand('reviewTransaction', transactionId)
  }

  async function postTransaction(transactionId) {
    return runCommand('postTransaction', transactionId)
  }

  async function reverseJournalEntry(entryId, reason) {
    return runCommand('reverseJournalEntry', entryId, reason)
  }

  async function closePeriod(periodId) {
    return runCommand('closePeriod', periodId)
  }

  async function deleteDraftTransaction(transactionId) {
    return runCommand('deleteDraftTransaction', transactionId)
  }

  return {
    initialized,
    runtimeMode,
    isLoading,
    error,
    accounts,
    transactions,
    journalEntries,
    periods,
    filters,
    currentUser,
    filteredTransactions,
    recentJournalEntries,
    openPeriods,
    closedPeriods,
    trialBalance,
    incomeStatement,
    balanceSheet,
    expenseStatement,
    balanceSnapshot,
    dashboardMetrics,
    ensureReady,
    refreshAll,
    seedDemoData,
    setFilters,
    can,
    canReviewTransaction,
    canPostTransaction,
    canReverseJournalEntry,
    reviewTransaction,
    postTransaction,
    reverseJournalEntry,
    closePeriod,
    deleteDraftTransaction,
  }
})
