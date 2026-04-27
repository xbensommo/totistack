/**
 * @file src/apps/finance/services/financeReportService.js
 * @description Ledger-derived finance reporting helpers.
 */

import { DEFAULT_SYSTEM_ACCOUNTS } from './financeChartOfAccounts.js'

/**
 * @param {Array<{ id: string, type: string, normalSide?: 'debit'|'credit', code?: string, name?: string }>} [accounts]
 * @returns {Map<string, { id: string, type: string, normalSide?: 'debit'|'credit', code?: string, name?: string }>}
 */
function createAccountMap(accounts = DEFAULT_SYSTEM_ACCOUNTS) {
  return new Map(accounts.map((account) => [account.id, account]))
}

/**
 * @param {Array<object>} entries
 * @param {{ from?: string, to?: string }} [range]
 * @returns {Array<object>}
 */
export function filterEntriesByRange(entries, range = {}) {
  const from = range.from || null
  const to = range.to || null

  return entries.filter((entry) => {
    const postedAt = entry.postedAt?.slice(0, 10) || ''
    if (from && postedAt < from) return false
    if (to && postedAt > to) return false
    return entry.status === 'posted' || entry.status === 'reversal'
  })
}

/**
 * @param {{ side: 'debit'|'credit', amount: number }} line
 * @param {{ normalSide?: 'debit'|'credit' }} account
 * @returns {number}
 */
function toSignedAmount(line, account) {
  return line.side === account.normalSide ? Number(line.amount || 0) : -Number(line.amount || 0)
}

/**
 * @param {Map<string, { amount: number, account: object }>} bucket
 * @returns {Array<{ accountId: string, code?: string, name?: string, amount: number }>}
 */
function bucketToRows(bucket) {
  return [...bucket.entries()]
    .map(([accountId, entry]) => ({
      accountId,
      code: entry.account.code,
      name: entry.account.name,
      amount: Number(entry.amount.toFixed(2)),
    }))
    .filter((row) => row.amount !== 0)
    .sort((a, b) => String(a.code || '').localeCompare(String(b.code || '')))
}

/**
 * Build a trial balance from ledger entries.
 *
 * @param {Array<{ lines: Array<{ accountId: string, side: 'debit'|'credit', amount: number }> }>} entries
 * @param {Array<{ id: string, type: string, code?: string, name?: string }>} [accounts]
 * @returns {{ rows: Array<{ accountId: string, code?: string, name?: string, debit: number, credit: number }>, totalDebit: number, totalCredit: number }}
 */
export function buildTrialBalance(entries, accounts = DEFAULT_SYSTEM_ACCOUNTS) {
  const accountMap = createAccountMap(accounts)
  const totals = new Map()

  for (const entry of entries) {
    for (const line of entry.lines || []) {
      const current = totals.get(line.accountId) || { debit: 0, credit: 0 }
      current[line.side] += Number(line.amount || 0)
      totals.set(line.accountId, current)
    }
  }

  const rows = [...totals.entries()].map(([accountId, amounts]) => {
    const account = accountMap.get(accountId) || { id: accountId }
    return {
      accountId,
      code: account.code,
      name: account.name,
      debit: Number(amounts.debit.toFixed(2)),
      credit: Number(amounts.credit.toFixed(2)),
    }
  })

  const totalDebit = Number(rows.reduce((sum, row) => sum + row.debit, 0).toFixed(2))
  const totalCredit = Number(rows.reduce((sum, row) => sum + row.credit, 0).toFixed(2))

  return { rows, totalDebit, totalCredit }
}

/**
 * Build a simple income statement from ledger entries.
 *
 * @param {Array<{ lines: Array<{ accountId: string, side: 'debit'|'credit', amount: number }> }>} entries
 * @param {Array<{ id: string, type: string, code?: string, name?: string }>} [accounts]
 * @returns {{
 *   revenue: number,
 *   expenses: number,
 *   netIncome: number,
 *   revenueRows: Array<{ accountId: string, code?: string, name?: string, amount: number }>,
 *   expenseRows: Array<{ accountId: string, code?: string, name?: string, amount: number }>
 * }}
 */
export function buildIncomeStatement(entries, accounts = DEFAULT_SYSTEM_ACCOUNTS) {
  const accountMap = createAccountMap(accounts)
  const revenueBucket = new Map()
  const expenseBucket = new Map()

  for (const entry of entries) {
    for (const line of entry.lines || []) {
      const account = accountMap.get(line.accountId)
      if (!account) continue

      if (account.type === 'revenue') {
        const current = revenueBucket.get(account.id) || { amount: 0, account }
        current.amount += line.side === 'credit' ? Number(line.amount || 0) : -Number(line.amount || 0)
        revenueBucket.set(account.id, current)
      }

      if (account.type === 'expense') {
        const current = expenseBucket.get(account.id) || { amount: 0, account }
        current.amount += line.side === 'debit' ? Number(line.amount || 0) : -Number(line.amount || 0)
        expenseBucket.set(account.id, current)
      }
    }
  }

  const revenueRows = bucketToRows(revenueBucket)
  const expenseRows = bucketToRows(expenseBucket)
  const revenue = Number(revenueRows.reduce((sum, row) => sum + row.amount, 0).toFixed(2))
  const expenses = Number(expenseRows.reduce((sum, row) => sum + row.amount, 0).toFixed(2))

  return {
    revenue,
    expenses,
    netIncome: Number((revenue - expenses).toFixed(2)),
    revenueRows,
    expenseRows,
  }
}

/**
 * Build a grouped balance sheet from ledger entries.
 *
 * @param {Array<{ lines: Array<{ accountId: string, side: 'debit'|'credit', amount: number }> }>} entries
 * @param {Array<{ id: string, type: string, normalSide: 'debit'|'credit', code?: string, name?: string }>} [accounts]
 * @returns {{
 *   assets: Array<{ accountId: string, code?: string, name?: string, amount: number }>,
 *   liabilities: Array<{ accountId: string, code?: string, name?: string, amount: number }>,
 *   equity: Array<{ accountId: string, code?: string, name?: string, amount: number }>,
 *   totalAssets: number,
 *   totalLiabilities: number,
 *   totalEquity: number,
 *   liabilitiesAndEquity: number
 * }}
 */
export function buildBalanceSheet(entries, accounts = DEFAULT_SYSTEM_ACCOUNTS) {
  const accountMap = createAccountMap(accounts)
  const buckets = {
    asset: new Map(),
    liability: new Map(),
    equity: new Map(),
  }

  for (const entry of entries) {
    for (const line of entry.lines || []) {
      const account = accountMap.get(line.accountId)
      if (!account) continue
      if (!buckets[account.type]) continue

      const current = buckets[account.type].get(account.id) || { amount: 0, account }
      current.amount += toSignedAmount(line, account)
      buckets[account.type].set(account.id, current)
    }
  }

  const assets = bucketToRows(buckets.asset)
  const liabilities = bucketToRows(buckets.liability)
  const equity = bucketToRows(buckets.equity)
  const totalAssets = Number(assets.reduce((sum, row) => sum + row.amount, 0).toFixed(2))
  const totalLiabilities = Number(liabilities.reduce((sum, row) => sum + row.amount, 0).toFixed(2))
  const totalEquity = Number(equity.reduce((sum, row) => sum + row.amount, 0).toFixed(2))

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
    liabilitiesAndEquity: Number((totalLiabilities + totalEquity).toFixed(2)),
  }
}

/**
 * Build an expense statement grouped by expense account.
 *
 * @param {Array<{ lines: Array<{ accountId: string, side: 'debit'|'credit', amount: number }> }>} entries
 * @param {Array<{ id: string, type: string, code?: string, name?: string }>} [accounts]
 * @returns {{ rows: Array<{ accountId: string, code?: string, name?: string, amount: number }>, totalExpenses: number }}
 */
export function buildExpenseStatement(entries, accounts = DEFAULT_SYSTEM_ACCOUNTS) {
  const expenseRows = buildIncomeStatement(entries, accounts).expenseRows
  return {
    rows: expenseRows,
    totalExpenses: Number(expenseRows.reduce((sum, row) => sum + row.amount, 0).toFixed(2)),
  }
}

/**
 * Build a balance snapshot grouped by account type.
 *
 * @param {Array<{ lines: Array<{ accountId: string, side: 'debit'|'credit', amount: number }> }>} entries
 * @param {Array<{ id: string, type: string, normalSide: 'debit'|'credit' }>} [accounts]
 * @returns {{ assets: number, liabilities: number, equity: number }}
 */
export function buildBalanceSnapshot(entries, accounts = DEFAULT_SYSTEM_ACCOUNTS) {
  const balanceSheet = buildBalanceSheet(entries, accounts)

  return {
    assets: balanceSheet.totalAssets,
    liabilities: balanceSheet.totalLiabilities,
    equity: balanceSheet.totalEquity,
  }
}
