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
  description: 'Double-entry accounting, finance operations, and ledger-derived reporting for Totistack.',
  version: '2.3.0',
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
  ],
}
