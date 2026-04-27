import test from 'node:test'
import assert from 'node:assert/strict'
import { buildFinanceDemoState } from '../services/financeSampleData.js'
import {
  buildBalanceSheet,
  buildExpenseStatement,
  buildIncomeStatement,
  buildTrialBalance,
} from '../services/financeReportService.js'

test('trial balance stays balanced for seeded finance data', () => {
  const state = buildFinanceDemoState()
  const trialBalance = buildTrialBalance(state.journalEntries, state.accounts)

  assert.equal(trialBalance.totalDebit, trialBalance.totalCredit)
  assert.ok(trialBalance.totalDebit > 0)
})

test('income statement returns positive revenue and expense totals', () => {
  const state = buildFinanceDemoState()
  const incomeStatement = buildIncomeStatement(state.journalEntries, state.accounts)

  assert.ok(incomeStatement.revenue > 0)
  assert.ok(incomeStatement.expenses > 0)
  assert.equal(
    incomeStatement.netIncome,
    Number((incomeStatement.revenue - incomeStatement.expenses).toFixed(2)),
  )
})

test('expense statement groups expense rows', () => {
  const state = buildFinanceDemoState()
  const expenseStatement = buildExpenseStatement(state.journalEntries, state.accounts)

  assert.ok(expenseStatement.rows.length >= 2)
  assert.ok(expenseStatement.totalExpenses > 0)
})

test('balance sheet returns assets and matching liabilities plus equity shape', () => {
  const state = buildFinanceDemoState()
  const balanceSheet = buildBalanceSheet(state.journalEntries, state.accounts)

  assert.ok(balanceSheet.assets.length > 0)
  assert.ok(balanceSheet.totalAssets > 0)
  assert.ok(balanceSheet.liabilitiesAndEquity >= 0)
})
