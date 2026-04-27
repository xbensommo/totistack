/** @file src/apps/finance/permissions.js */

import { FINANCE_ACTIONS } from './permissions/finance.permissions.js'

const ALL = Object.values(FINANCE_ACTIONS)

export default {
  module: 'finance',
  permissions: ALL.map((key) => ({
    key,
    resource: key.split('.').slice(1, -1).join('.') || 'general',
    action: key.split('.').at(-1) || '',
    description: `Finance permission ${key}`,
  })),
  roleTemplates: {
    admin: ALL,
    sysadmin: ALL,
    accountant: ALL,
    receptionist: [
      FINANCE_ACTIONS.VIEW,
      FINANCE_ACTIONS.TRANSACTION_CREATE,
      FINANCE_ACTIONS.TRANSACTION_READ,
      FINANCE_ACTIONS.TRANSACTION_EDIT_DRAFT,
      FINANCE_ACTIONS.TRANSACTION_DELETE_DRAFT,
      FINANCE_ACTIONS.REPORT_READ,
    ],
    consultant: [
      FINANCE_ACTIONS.VIEW,
      FINANCE_ACTIONS.OWN_PAYOUT_READ,
    ],
  },
}
