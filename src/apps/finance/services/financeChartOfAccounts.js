/**
 * @file src/apps/finance/services/financeChartOfAccounts.js
 * @description Default system accounts and lookup helpers.
 */

export const SYSTEM_ACCOUNT_KEYS = Object.freeze({
  CASH: 'cash',
  ACCOUNTS_RECEIVABLE: 'accounts_receivable',
  ACCOUNTS_PAYABLE: 'accounts_payable',
  CONSULTANT_PAYABLE: 'consultant_payable',
  SERVICE_REVENUE: 'service_revenue',
  CONSULTANT_COST: 'consultant_cost',
  OPERATING_EXPENSE: 'operating_expense',
  OWNER_EQUITY: 'owner_equity',
  SALES_RETURNS: 'sales_returns',
})

export const DEFAULT_SYSTEM_ACCOUNTS = Object.freeze([
  {
    id: SYSTEM_ACCOUNT_KEYS.CASH,
    code: '1000',
    name: 'Cash / Bank',
    type: 'asset',
    normalSide: 'debit',
    isSystem: true,
  },
  {
    id: SYSTEM_ACCOUNT_KEYS.ACCOUNTS_RECEIVABLE,
    code: '1100',
    name: 'Accounts Receivable',
    type: 'asset',
    normalSide: 'debit',
    isSystem: true,
  },
  {
    id: SYSTEM_ACCOUNT_KEYS.ACCOUNTS_PAYABLE,
    code: '2000',
    name: 'Accounts Payable',
    type: 'liability',
    normalSide: 'credit',
    isSystem: true,
  },
  {
    id: SYSTEM_ACCOUNT_KEYS.CONSULTANT_PAYABLE,
    code: '2100',
    name: 'Consultant Payable',
    type: 'liability',
    normalSide: 'credit',
    isSystem: true,
  },
  {
    id: SYSTEM_ACCOUNT_KEYS.SERVICE_REVENUE,
    code: '4000',
    name: 'Service Revenue',
    type: 'revenue',
    normalSide: 'credit',
    isSystem: true,
  },
  {
    id: SYSTEM_ACCOUNT_KEYS.SALES_RETURNS,
    code: '4010',
    name: 'Sales Returns and Refunds',
    type: 'expense',
    normalSide: 'debit',
    isSystem: true,
  },
  {
    id: SYSTEM_ACCOUNT_KEYS.CONSULTANT_COST,
    code: '5000',
    name: 'Consultant Cost',
    type: 'expense',
    normalSide: 'debit',
    isSystem: true,
  },
  {
    id: SYSTEM_ACCOUNT_KEYS.OPERATING_EXPENSE,
    code: '5100',
    name: 'Operating Expense',
    type: 'expense',
    normalSide: 'debit',
    isSystem: true,
  },
  {
    id: SYSTEM_ACCOUNT_KEYS.OWNER_EQUITY,
    code: '3000',
    name: 'Owner Equity',
    type: 'equity',
    normalSide: 'credit',
    isSystem: true,
  },
])

/**
 * Create a fast account resolver.
 *
 * @param {Array<{ id: string }>} [accounts=[]]
 * @returns {(accountId: string) => { id: string } | undefined}
 */
export function createAccountResolver(accounts = DEFAULT_SYSTEM_ACCOUNTS) {
  const byId = new Map(accounts.map((account) => [account.id, account]))

  return function resolveAccount(accountId) {
    return byId.get(accountId)
  }
}
