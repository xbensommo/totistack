/**
 * @file src/apps/finance/routes/index.js
 * @description Finance route contribution.
 */

const FinanceDashboardPage = () => import('../pages/FinanceDashboardPage.vue')
const FinanceTransactionsPage = () => import('../pages/FinanceTransactionsPage.vue')
const FinanceAccountsPage = () => import('../pages/FinanceAccountsPage.vue')
const FinanceReportsPage = () => import('../pages/FinanceReportsPage.vue')
const FinanceBalanceSheetPage = () => import('../pages/FinanceBalanceSheetPage.vue')
const FinanceIncomeStatementPage = () => import('../pages/FinanceIncomeStatementPage.vue')
const FinanceExpenseStatementPage = () => import('../pages/FinanceExpenseStatementPage.vue')

export default [
  {
    path: '/finance',
    name: 'FinanceDashboard',
    component: FinanceDashboardPage,
    meta: {
      title: 'Finance Dashboard',
      requiresAuth: true,
      app: 'finance',
      permission: 'finance.view',
    },
  },
  {
    path: '/finance/transactions',
    name: 'FinanceTransactions',
    component: FinanceTransactionsPage,
    meta: {
      title: 'Finance Transactions',
      requiresAuth: true,
      app: 'finance',
      permission: 'finance.transaction.read',
    },
  },
  {
    path: '/finance/accounts',
    name: 'FinanceAccounts',
    component: FinanceAccountsPage,
    meta: {
      title: 'Chart of Accounts',
      requiresAuth: true,
      app: 'finance',
      permission: 'finance.account.manage',
    },
  },
  {
    path: '/finance/reports',
    name: 'FinanceReports',
    component: FinanceReportsPage,
    meta: {
      title: 'Finance Reports',
      requiresAuth: true,
      app: 'finance',
      permission: 'finance.report.read',
    },
  },
  {
    path: '/finance/reports/balance-sheet',
    name: 'FinanceBalanceSheet',
    component: FinanceBalanceSheetPage,
    meta: {
      title: 'Balance Sheet',
      requiresAuth: true,
      app: 'finance',
      permission: 'finance.report.read',
    },
  },
  {
    path: '/finance/reports/income-statement',
    name: 'FinanceIncomeStatement',
    component: FinanceIncomeStatementPage,
    meta: {
      title: 'Income Statement',
      requiresAuth: true,
      app: 'finance',
      permission: 'finance.report.read',
    },
  },
  {
    path: '/finance/reports/expense-statement',
    name: 'FinanceExpenseStatement',
    component: FinanceExpenseStatementPage,
    meta: {
      title: 'Expense Statement',
      requiresAuth: true,
      app: 'finance',
      permission: 'finance.report.read',
    },
  },
]
