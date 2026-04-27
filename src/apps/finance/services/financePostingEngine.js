/**
 * @file src/apps/finance/services/financePostingEngine.js
 * @description Double-entry posting engine.
 */

import {
  DEFAULT_SYSTEM_ACCOUNTS,
  SYSTEM_ACCOUNT_KEYS,
  createAccountResolver,
} from './financeChartOfAccounts.js'
import { FinanceError, invariant } from './financeErrors.js'

/**
 * @param {number|string} value
 * @returns {number}
 */
function toAmount(value) {
  const amount = Number(value)
  invariant(Number.isFinite(amount) && amount > 0, 'Amount must be greater than zero.', {
    code: 'FINANCE_INVALID_AMOUNT',
  })
  return Number(amount.toFixed(2))
}

/**
 * @param {string} isoDate
 * @returns {string}
 */
function toPeriodKey(isoDate) {
  invariant(/^\d{4}-\d{2}-\d{2}/.test(isoDate), 'occurredOn must be an ISO date.', {
    code: 'FINANCE_INVALID_DATE',
    meta: { occurredOn: isoDate },
  })
  return isoDate.slice(0, 7)
}

/**
 * @param {Array<{ side: 'debit'|'credit', amount: number }>} lines
 */
function assertBalanced(lines) {
  const totalDebit = lines
    .filter((line) => line.side === 'debit')
    .reduce((sum, line) => sum + line.amount, 0)
  const totalCredit = lines
    .filter((line) => line.side === 'credit')
    .reduce((sum, line) => sum + line.amount, 0)

  invariant(totalDebit > 0 && totalCredit > 0, 'Journal entry must contain debit and credit lines.', {
    code: 'FINANCE_EMPTY_ENTRY',
  })

  invariant(
    Number(totalDebit.toFixed(2)) === Number(totalCredit.toFixed(2)),
    'Journal entry is not balanced.',
    {
      code: 'FINANCE_UNBALANCED_ENTRY',
      meta: { totalDebit, totalCredit },
    },
  )
}

/**
 * @param {string} accountId
 * @param {'debit'|'credit'} side
 * @param {number} amount
 * @param {string} memo
 * @param {(accountId: string) => { id: string } | undefined} resolveAccount
 * @returns {{ accountId: string, side: 'debit'|'credit', amount: number, memo: string }}
 */
function createLine(accountId, side, amount, memo, resolveAccount) {
  invariant(resolveAccount(accountId), `Unknown account '${accountId}'.`, {
    code: 'FINANCE_UNKNOWN_ACCOUNT',
    meta: { accountId },
  })

  return {
    accountId,
    side,
    amount: Number(amount.toFixed(2)),
    memo,
  }
}

/**
 * Build posting lines for a transaction.
 *
 * @param {object} options
 * @param {{
 *   id: string,
 *   type: string,
 *   amount: number,
 *   occurredOn: string,
 *   memo?: string,
 *   status?: string,
 *   lines?: Array<{ accountId: string, side: 'debit'|'credit', amount: number, memo?: string }>,
 *   accountOverrides?: Record<string, string>
 * }} options.transaction
 * @param {Array<{ id: string }>} [options.accounts]
 * @param {{ id?: string } | null} [options.actor]
 * @param {() => string} [options.idFactory]
 * @param {() => string} [options.nowFactory]
 * @returns {{
 *   id: string,
 *   transactionId: string,
 *   transactionType: string,
 *   status: 'posted',
 *   postedAt: string,
 *   periodKey: string,
 *   totalDebit: number,
 *   totalCredit: number,
 *   createdBy: string | null,
 *   lines: Array<{ accountId: string, side: 'debit'|'credit', amount: number, memo: string }>
 * }}
 */
export function createPostedJournalEntry({
  transaction,
  accounts = DEFAULT_SYSTEM_ACCOUNTS,
  actor = null,
  idFactory = () => `je_${Math.random().toString(36).slice(2, 10)}`,
  nowFactory = () => new Date().toISOString(),
}) {
  invariant(transaction?.id, 'Transaction id is required.', { code: 'FINANCE_TRANSACTION_ID_REQUIRED' })
  invariant(transaction?.type, 'Transaction type is required.', { code: 'FINANCE_TRANSACTION_TYPE_REQUIRED' })
  invariant(transaction?.occurredOn, 'Transaction occurredOn is required.', { code: 'FINANCE_TRANSACTION_DATE_REQUIRED' })

  const amount = toAmount(transaction.amount)
  const resolveAccount = createAccountResolver(accounts)
  const memo = transaction.memo || `Posted ${transaction.type} ${transaction.id}`
  const overrides = transaction.accountOverrides || {}

  /** @type {Array<{ accountId: string, side: 'debit'|'credit', amount: number, memo: string }>} */
  let lines = []

  switch (transaction.type) {
    case 'invoice':
      lines = [
        createLine(
          overrides.receivableAccountId || SYSTEM_ACCOUNT_KEYS.ACCOUNTS_RECEIVABLE,
          'debit',
          amount,
          memo,
          resolveAccount,
        ),
        createLine(
          overrides.revenueAccountId || SYSTEM_ACCOUNT_KEYS.SERVICE_REVENUE,
          'credit',
          amount,
          memo,
          resolveAccount,
        ),
      ]
      break

    case 'receipt':
      lines = [
        createLine(
          overrides.cashAccountId || SYSTEM_ACCOUNT_KEYS.CASH,
          'debit',
          amount,
          memo,
          resolveAccount,
        ),
        createLine(
          overrides.receivableAccountId || SYSTEM_ACCOUNT_KEYS.ACCOUNTS_RECEIVABLE,
          'credit',
          amount,
          memo,
          resolveAccount,
        ),
      ]
      break

    case 'payment':
      lines = [
        createLine(
          overrides.cashAccountId || SYSTEM_ACCOUNT_KEYS.CASH,
          'debit',
          amount,
          memo,
          resolveAccount,
        ),
        createLine(
          overrides.revenueAccountId || SYSTEM_ACCOUNT_KEYS.SERVICE_REVENUE,
          'credit',
          amount,
          memo,
          resolveAccount,
        ),
      ]
      break

    case 'bill':
      lines = [
        createLine(
          overrides.expenseAccountId || SYSTEM_ACCOUNT_KEYS.OPERATING_EXPENSE,
          'debit',
          amount,
          memo,
          resolveAccount,
        ),
        createLine(
          overrides.payableAccountId || SYSTEM_ACCOUNT_KEYS.ACCOUNTS_PAYABLE,
          'credit',
          amount,
          memo,
          resolveAccount,
        ),
      ]
      break

    case 'supplier_payment':
      lines = [
        createLine(
          overrides.payableAccountId || SYSTEM_ACCOUNT_KEYS.ACCOUNTS_PAYABLE,
          'debit',
          amount,
          memo,
          resolveAccount,
        ),
        createLine(
          overrides.cashAccountId || SYSTEM_ACCOUNT_KEYS.CASH,
          'credit',
          amount,
          memo,
          resolveAccount,
        ),
      ]
      break

    case 'expense':
      lines = [
        createLine(
          overrides.expenseAccountId || SYSTEM_ACCOUNT_KEYS.OPERATING_EXPENSE,
          'debit',
          amount,
          memo,
          resolveAccount,
        ),
        createLine(
          overrides.cashAccountId || SYSTEM_ACCOUNT_KEYS.CASH,
          'credit',
          amount,
          memo,
          resolveAccount,
        ),
      ]
      break

    case 'payout':
    case 'payout_accrual':
      lines = [
        createLine(
          overrides.consultantCostAccountId || SYSTEM_ACCOUNT_KEYS.CONSULTANT_COST,
          'debit',
          amount,
          memo,
          resolveAccount,
        ),
        createLine(
          overrides.consultantPayableAccountId || SYSTEM_ACCOUNT_KEYS.CONSULTANT_PAYABLE,
          'credit',
          amount,
          memo,
          resolveAccount,
        ),
      ]
      break

    case 'payout_payment':
      lines = [
        createLine(
          overrides.consultantPayableAccountId || SYSTEM_ACCOUNT_KEYS.CONSULTANT_PAYABLE,
          'debit',
          amount,
          memo,
          resolveAccount,
        ),
        createLine(
          overrides.cashAccountId || SYSTEM_ACCOUNT_KEYS.CASH,
          'credit',
          amount,
          memo,
          resolveAccount,
        ),
      ]
      break

    case 'refund':
      lines = [
        createLine(
          overrides.refundDebitAccountId || SYSTEM_ACCOUNT_KEYS.SALES_RETURNS,
          'debit',
          amount,
          memo,
          resolveAccount,
        ),
        createLine(
          overrides.cashAccountId || SYSTEM_ACCOUNT_KEYS.CASH,
          'credit',
          amount,
          memo,
          resolveAccount,
        ),
      ]
      break

    case 'transfer':
      invariant(
        overrides.fromCashAccountId && overrides.toCashAccountId,
        'Transfer requires fromCashAccountId and toCashAccountId account overrides.',
        {
          code: 'FINANCE_TRANSFER_ACCOUNTS_REQUIRED',
        },
      )
      lines = [
        createLine(overrides.toCashAccountId, 'debit', amount, memo, resolveAccount),
        createLine(overrides.fromCashAccountId, 'credit', amount, memo, resolveAccount),
      ]
      break

    case 'adjustment':
      invariant(Array.isArray(transaction.lines) && transaction.lines.length >= 2, 'Adjustment requires explicit lines.', {
        code: 'FINANCE_ADJUSTMENT_LINES_REQUIRED',
      })
      lines = transaction.lines.map((line) => createLine(
        line.accountId,
        line.side,
        toAmount(line.amount),
        line.memo || memo,
        resolveAccount,
      ))
      break

    default:
      throw new FinanceError(`Unsupported transaction type '${transaction.type}'.`, {
        code: 'FINANCE_UNSUPPORTED_TRANSACTION_TYPE',
        meta: { type: transaction?.type },
      })
  }

  assertBalanced(lines)

  const totalDebit = Number(lines
    .filter((line) => line.side === 'debit')
    .reduce((sum, line) => sum + line.amount, 0)
    .toFixed(2))
  const totalCredit = Number(lines
    .filter((line) => line.side === 'credit')
    .reduce((sum, line) => sum + line.amount, 0)
    .toFixed(2))

  return {
    id: idFactory(),
    transactionId: transaction.id,
    transactionType: transaction.type,
    status: 'posted',
    postedAt: nowFactory(),
    periodKey: toPeriodKey(transaction.occurredOn),
    createdBy: actor?.id || null,
    totalDebit,
    totalCredit,
    lines,
  }
}

/**
 * Create a reversal entry for an already-posted journal entry.
 *
 * @param {object} options
 * @param {{ id: string, transactionId: string, transactionType: string, lines: Array<{ accountId: string, side: 'debit'|'credit', amount: number, memo: string }>, totalDebit: number, totalCredit: number }} options.postedEntry
 * @param {{ id?: string } | null} [options.actor]
 * @param {string} [options.reason='Manual reversal']
 * @param {() => string} [options.idFactory]
 * @param {() => string} [options.nowFactory]
 * @returns {{
 *   id: string,
 *   transactionId: string,
 *   transactionType: string,
 *   status: 'reversal',
 *   postedAt: string,
 *   periodKey: string,
 *   totalDebit: number,
 *   totalCredit: number,
 *   reversalOfEntryId: string,
 *   createdBy: string | null,
 *   lines: Array<{ accountId: string, side: 'debit'|'credit', amount: number, memo: string }>
 * }}
 */
export function createReversalJournalEntry({
  postedEntry,
  actor = null,
  reason = 'Manual reversal',
  idFactory = () => `je_${Math.random().toString(36).slice(2, 10)}`,
  nowFactory = () => new Date().toISOString(),
}) {
  const postedAt = nowFactory()
  invariant(postedEntry?.id, 'Posted entry id is required.', { code: 'FINANCE_POSTED_ENTRY_ID_REQUIRED' })
  invariant(Array.isArray(postedEntry?.lines) && postedEntry.lines.length >= 2, 'Posted entry lines are required.', {
    code: 'FINANCE_POSTED_ENTRY_LINES_REQUIRED',
  })

  const reversedLines = postedEntry.lines.map((line) => ({
    accountId: line.accountId,
    side: line.side === 'debit' ? 'credit' : 'debit',
    amount: Number(line.amount || 0),
    memo: `${line.memo || postedEntry.transactionType} (${reason})`,
  }))

  assertBalanced(reversedLines)

  return {
    id: idFactory(),
    transactionId: postedEntry.transactionId,
    transactionType: postedEntry.transactionType,
    status: 'reversal',
    postedAt,
    periodKey: toPeriodKey(postedAt),
    reversalOfEntryId: postedEntry.id,
    createdBy: actor?.id || null,
    totalDebit: Number(postedEntry.totalDebit || 0),
    totalCredit: Number(postedEntry.totalCredit || 0),
    lines: reversedLines,
  }
}
