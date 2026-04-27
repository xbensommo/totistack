/**
 * @file src/apps/finance/index.js
 * @description Finance app barrel exports.
 */
import { createFinanceActionDefinitions } from './finance.actions.js'

export { default as manifest } from './app.manifest.js'
export { default as routes } from './routes.js'
export { default as navigation } from './navigation.js'
export { default as definitions } from './definitions/index.js'

export { default as financeAccounts } from './definitions/accounts.definitions.js'
export { default as financeJournalEntries } from './definitions/journal-entries.definitions.js'
export { default as financePeriods } from './definitions/periods.definitions.js'
export { default as financeTransactions } from './definitions/transactions.definitions.js'

export { FINANCE_ACTIONS, FINANCE_ROLES, canFinance, requireFinance } from './permissions/finance.permissions.js'
export { createFinanceRepositories, FINANCE_COLLECTIONS } from './services/createFinanceRepositories.js'
export { createFinanceCommandBus } from './services/createFinanceCommandBus.js'
export { createFinanceModule } from './services/createFinanceModule.js'
export { configureFinanceRuntime, getFinanceRuntime, clearFinanceRuntime } from './services/financeRuntime.js'
export * as financeReports from './services/financeReportService.js'

export { createFinanceNotifications } from './services/createFinanceNotifications.js'
export { createFinanceActionDefinitions }

export * from './services/financePdfEngine.js'
export * from './services/invoicePdfService.js'
export * from './services/quotationPdfService.js'
export { default as FinanceDocumentsPage } from './pages/FinanceDocumentsPage.vue'
