/**
 * @file src/apps/finance/services/createFinanceCommandBus.js
 * @description Command layer with confirm-gated finance actions.
 */

import {
  FINANCE_ACTIONS,
  requireFinance,
} from '../permissions/finance.permissions.js'
import { createPostedJournalEntry, createReversalJournalEntry } from './financePostingEngine.js'
import { FinanceConflictError, FinanceValidationError, invariant } from './financeErrors.js'

/**
 * @typedef {{
 *   getById: (id: string) => Promise<any>,
 *   add: (record: any) => Promise<any>,
 *   update: (id: string, patch: any) => Promise<any>,
 *   remove?: (id: string) => Promise<any>,
 *   fetchList?: (options?: any) => Promise<any[]>,
 *   getItems?: () => any[],
 * }} CrudRepository
 */

function toPeriodKey(isoDate) {
  return String(isoDate || '').slice(0, 7)
}

async function getRepoItems(repository) {
  if (typeof repository?.fetchList === 'function') {
    await repository.fetchList()
  }

  if (typeof repository?.getItems === 'function') {
    return repository.getItems()
  }

  return []
}

async function findPeriodByKey(repository, key) {
  const items = await getRepoItems(repository)
  return items.find((period) => period?.key === key) || null
}

async function ensureOpenPeriodForDate(repository, isoDate) {
  if (!repository || !isoDate) return null

  const periodKey = toPeriodKey(isoDate)
  const period = await findPeriodByKey(repository, periodKey)
  invariant(period, `Accounting period '${periodKey}' was not found.`, {
    code: 'FINANCE_PERIOD_NOT_FOUND',
    errorClass: FinanceValidationError,
    meta: { periodKey },
  })
  invariant(period.status === 'open', `Accounting period '${periodKey}' is closed.`, {
    code: 'FINANCE_PERIOD_CLOSED',
    errorClass: FinanceConflictError,
    meta: { periodKey },
  })
  return period
}

async function findPostedEntryForTransaction(repository, transactionId) {
  const items = await getRepoItems(repository)
  return items.find((entry) => entry?.transactionId === transactionId && entry?.status === 'posted') || null
}

/**
 * @param {object} options
 * @param {{ transactions: CrudRepository, journalEntries: CrudRepository, periods?: CrudRepository }} options.repositories
 * @param {(context: { title: string, message: string, confirmText: string, tone?: string }) => Promise<boolean>} options.confirm
 * @param {() => ({ id?: string, roles?: string[] } | null)} options.getCurrentUser
 * @param {(args: { transaction: any, actor?: any }) => any} [options.postEntry]
 * @param {(args: { postedEntry: any, actor?: any, reason?: string }) => any} [options.reverseEntry]
 * @param {{ transactionReviewed?: Function, transactionPosted?: Function, journalReversed?: Function, periodClosed?: Function }|null} [options.notifications]
 * @returns {{
 *   reviewTransaction: (transactionId: string) => Promise<any>,
 *   postTransaction: (transactionId: string) => Promise<any>,
 *   reverseJournalEntry: (entryId: string, reason?: string) => Promise<any>,
 *   deleteDraftTransaction: (transactionId: string) => Promise<any>,
 *   closePeriod: (periodId: string) => Promise<any>,
 * }}
 */
export function createFinanceCommandBus({
  repositories,
  confirm,
  getCurrentUser,
  postEntry = createPostedJournalEntry,
  reverseEntry = createReversalJournalEntry,
  notifications = null,
}) {
  invariant(typeof confirm === 'function', 'Finance confirm handler is required.', {
    code: 'FINANCE_CONFIRM_HANDLER_REQUIRED',
    errorClass: FinanceValidationError,
  })

  async function confirmOrReturn(payload) {
    const accepted = await confirm(payload)
    if (!accepted) return { status: 'cancelled' }
    return null
  }

  return {
    async reviewTransaction(transactionId) {
      const user = getCurrentUser()
      requireFinance(user, FINANCE_ACTIONS.TRANSACTION_REVIEW)

      const transaction = await repositories.transactions.getById(transactionId)
      invariant(transaction, 'Transaction not found.', {
        code: 'FINANCE_TRANSACTION_NOT_FOUND',
        errorClass: FinanceValidationError,
        meta: { transactionId },
      })
      invariant(transaction.status === 'draft', 'Only draft transactions can be reviewed.', {
        code: 'FINANCE_INVALID_TRANSACTION_STATE',
        errorClass: FinanceConflictError,
        meta: { status: transaction.status },
      })

      const reviewedAt = new Date().toISOString()
      await repositories.transactions.update(transactionId, {
        status: 'reviewed',
        reviewedAt,
        reviewedBy: user?.id || null,
      })

      const reviewedTransaction = { ...transaction, id: transactionId, status: 'reviewed', reviewedAt, reviewedBy: user?.id || null }
      await notifications?.transactionReviewed?.(reviewedTransaction, user)

      return { status: 'reviewed', transactionId }
    },

    async postTransaction(transactionId) {
      const user = getCurrentUser()
      requireFinance(user, FINANCE_ACTIONS.TRANSACTION_POST)

      const transaction = await repositories.transactions.getById(transactionId)
      invariant(transaction, 'Transaction not found.', {
        code: 'FINANCE_TRANSACTION_NOT_FOUND',
        errorClass: FinanceValidationError,
        meta: { transactionId },
      })
      invariant(
        ['draft', 'reviewed'].includes(transaction.status),
        'Only draft or reviewed transactions can be posted.',
        {
          code: 'FINANCE_INVALID_TRANSACTION_STATE',
          errorClass: FinanceConflictError,
          meta: { status: transaction.status },
        },
      )
      invariant(!transaction.postedJournalEntryId, 'This transaction has already been posted.', {
        code: 'FINANCE_TRANSACTION_ALREADY_POSTED',
        errorClass: FinanceConflictError,
        meta: { transactionId, postedJournalEntryId: transaction.postedJournalEntryId || null },
      })

      const existingEntry = await findPostedEntryForTransaction(repositories.journalEntries, transactionId)
      invariant(!existingEntry, 'A posted journal entry already exists for this transaction.', {
        code: 'FINANCE_DUPLICATE_POSTING',
        errorClass: FinanceConflictError,
        meta: { transactionId, journalEntryId: existingEntry?.id || null },
      })

      await ensureOpenPeriodForDate(repositories.periods, transaction.occurredOn)

      const cancelled = await confirmOrReturn({
        title: 'Post transaction',
        message: 'This will create a ledger entry and affect reports and balances.',
        confirmText: 'Post transaction',
        tone: 'danger',
      })
      if (cancelled) return cancelled

      const entry = postEntry({ transaction, actor: user })
      await repositories.journalEntries.add(entry)
      await repositories.transactions.update(transactionId, {
        status: 'posted',
        postedAt: entry.postedAt,
        postedBy: user?.id || null,
        postedJournalEntryId: entry.id,
      })
      await notifications?.transactionPosted?.({ ...transaction, id: transactionId, status: 'posted', postedAt: entry.postedAt, postedBy: user?.id || null, postedJournalEntryId: entry.id }, user)

      return {
        status: 'posted',
        transactionId,
        journalEntryId: entry.id,
      }
    },

    async reverseJournalEntry(entryId, reason = 'Manual reversal') {
      const user = getCurrentUser()
      requireFinance(user, FINANCE_ACTIONS.JOURNAL_REVERSE)

      const postedEntry = await repositories.journalEntries.getById(entryId)
      invariant(postedEntry, 'Journal entry not found.', {
        code: 'FINANCE_JOURNAL_ENTRY_NOT_FOUND',
        errorClass: FinanceValidationError,
        meta: { entryId },
      })
      invariant(postedEntry.status === 'posted', 'Only posted entries can be reversed.', {
        code: 'FINANCE_INVALID_JOURNAL_STATE',
        errorClass: FinanceConflictError,
        meta: { status: postedEntry.status },
      })
      invariant(!postedEntry.reversedEntryId, 'This journal entry has already been reversed.', {
        code: 'FINANCE_JOURNAL_ALREADY_REVERSED',
        errorClass: FinanceConflictError,
        meta: { entryId, reversedEntryId: postedEntry.reversedEntryId || null },
      })

      const cancelled = await confirmOrReturn({
        title: 'Reverse journal entry',
        message: 'This creates a reversal entry and keeps the audit trail intact.',
        confirmText: 'Reverse entry',
        tone: 'danger',
      })
      if (cancelled) return cancelled

      const reversal = reverseEntry({ postedEntry, actor: user, reason })
      await ensureOpenPeriodForDate(repositories.periods, reversal.postedAt)

      await repositories.journalEntries.add(reversal)
      await repositories.journalEntries.update(entryId, {
        reversedEntryId: reversal.id,
      })
      await repositories.transactions.update(postedEntry.transactionId, {
        status: 'reversed',
        reversedAt: reversal.postedAt,
        reversalJournalEntryId: reversal.id,
      })
      await notifications?.journalReversed?.({ ...postedEntry, id: entryId, reversedEntryId: reversal.id }, user)

      return {
        status: 'reversed',
        entryId,
        reversalEntryId: reversal.id,
      }
    },

    async deleteDraftTransaction(transactionId) {
      const user = getCurrentUser()
      requireFinance(user, FINANCE_ACTIONS.TRANSACTION_DELETE_DRAFT)

      const transaction = await repositories.transactions.getById(transactionId)
      invariant(transaction, 'Transaction not found.', {
        code: 'FINANCE_TRANSACTION_NOT_FOUND',
        errorClass: FinanceValidationError,
        meta: { transactionId },
      })
      invariant(transaction.status === 'draft', 'Only draft transactions can be deleted.', {
        code: 'FINANCE_INVALID_TRANSACTION_STATE',
        errorClass: FinanceConflictError,
        meta: { status: transaction.status },
      })
      invariant(typeof repositories.transactions.remove === 'function', 'Draft delete repository method is missing.', {
        code: 'FINANCE_DELETE_METHOD_REQUIRED',
        errorClass: FinanceValidationError,
      })

      const cancelled = await confirmOrReturn({
        title: 'Delete draft transaction',
        message: 'This removes the draft before it reaches the ledger.',
        confirmText: 'Delete draft',
        tone: 'danger',
      })
      if (cancelled) return cancelled

      await repositories.transactions.remove(transactionId)
      return { status: 'deleted', transactionId }
    },

    async closePeriod(periodId) {
      const user = getCurrentUser()
      requireFinance(user, FINANCE_ACTIONS.PERIOD_CLOSE)
      invariant(repositories.periods, 'Periods repository is required to close a period.', {
        code: 'FINANCE_PERIODS_REPOSITORY_REQUIRED',
        errorClass: FinanceValidationError,
      })

      const period = await repositories.periods.getById(periodId)
      invariant(period, 'Period not found.', {
        code: 'FINANCE_PERIOD_NOT_FOUND',
        errorClass: FinanceValidationError,
        meta: { periodId },
      })
      invariant(period.status === 'open', 'Only open periods can be closed.', {
        code: 'FINANCE_INVALID_PERIOD_STATE',
        errorClass: FinanceConflictError,
        meta: { status: period.status },
      })

      const transactions = await getRepoItems(repositories.transactions)
      const blockingTransactions = transactions.filter((transaction) => {
        const periodKey = toPeriodKey(transaction?.occurredOn)
        return periodKey === period.key && ['draft', 'reviewed'].includes(transaction?.status)
      })

      invariant(blockingTransactions.length === 0, 'Cannot close a period with draft or reviewed transactions still pending.', {
        code: 'FINANCE_PERIOD_HAS_PENDING_TRANSACTIONS',
        errorClass: FinanceConflictError,
        meta: {
          periodId,
          periodKey: period.key,
          blockingTransactionIds: blockingTransactions.map((transaction) => transaction.id),
        },
      })

      const cancelled = await confirmOrReturn({
        title: 'Close accounting period',
        message: 'Closing a period locks operational posting for that range.',
        confirmText: 'Close period',
        tone: 'danger',
      })
      if (cancelled) return cancelled

      const closedAt = new Date().toISOString()
      await repositories.periods.update(periodId, {
        status: 'closed',
        closedAt,
        closedBy: user?.id || null,
      })
      await notifications?.periodClosed?.({ ...period, id: periodId, status: 'closed', closedAt, closedBy: user?.id || null }, user)

      return { status: 'closed', periodId }
    },
  }
}
