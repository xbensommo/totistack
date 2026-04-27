/**
 * @file src/apps/finance/app.manifest.js
 * @description Totistack finance app manifest.
 */

import routes from './routes/index.js'
import navigation from './navigation.js'
import {
  FINANCE_ACTIONS,
  FINANCE_ROLES,
} from './permissions/finance.permissions.js'

export default {
  id: 'finance',
  type: 'app',
  name: 'Finance',
  description: 'Double-entry accounting, ledger-derived reporting, and client-facing PDF document generation for Totistack.',
  version: '2.2.13',
  routes,
  navigation,
  collections: ['finance_accounts', 'finance_periods', 'finance_journal_entries', 'finance_transactions'],
  permissions: {
    roles: Object.values(FINANCE_ROLES),
    actions: Object.values(FINANCE_ACTIONS),
  },
  dependencies: {
    features: ['auth', 'rbac', 'notifications'],
    apps: [],
  },
  capabilities: [
    'double-entry-ledger',
    'balance-sheet',
    'income-statement',
    'expense-statement',
    'draft-review-post-flow',
    'confirm-guarded-actions',
    'period-closing',
    'rbac-finance-operations',
    'notification-aware-ledger',
    'finance-pdf-engine',
    'invoice-pdf',
    'quotation-pdf',
    'receipt-pdf',
    'payment-confirmation-pdf',
  ],
}
