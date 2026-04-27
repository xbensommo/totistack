/**
 * @file src/apps/finance/permissions/finance.permissions.js
 * @description RBAC for the finance app.
 */

import { FinanceAuthorizationError } from '../services/financeErrors.js'

export const FINANCE_ROLES = Object.freeze({
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  RECEPTIONIST: 'receptionist',
  CONSULTANT: 'consultant',
  SYSADMIN: 'sysadmin',
})

export const FINANCE_ACTIONS = Object.freeze({
  VIEW: 'finance.view',
  ACCOUNT_MANAGE: 'finance.account.manage',
  TRANSACTION_CREATE: 'finance.transaction.create',
  TRANSACTION_READ: 'finance.transaction.read',
  TRANSACTION_EDIT_DRAFT: 'finance.transaction.edit_draft',
  TRANSACTION_DELETE_DRAFT: 'finance.transaction.delete_draft',
  TRANSACTION_REVIEW: 'finance.transaction.review',
  TRANSACTION_POST: 'finance.transaction.post',
  JOURNAL_REVERSE: 'finance.journal.reverse',
  REPORT_READ: 'finance.report.read',
  PERIOD_CLOSE: 'finance.period.close',
  PAYOUT_APPROVE: 'finance.payout.approve',
  OWN_PAYOUT_READ: 'finance.own_payout.read',
})

const allActions = new Set(Object.values(FINANCE_ACTIONS))

export const FINANCE_ROLE_MATRIX = Object.freeze({
  [FINANCE_ROLES.ADMIN]: allActions,
  [FINANCE_ROLES.SYSADMIN]: allActions,
  [FINANCE_ROLES.ACCOUNTANT]: new Set([
    FINANCE_ACTIONS.VIEW,
    FINANCE_ACTIONS.ACCOUNT_MANAGE,
    FINANCE_ACTIONS.TRANSACTION_CREATE,
    FINANCE_ACTIONS.TRANSACTION_READ,
    FINANCE_ACTIONS.TRANSACTION_EDIT_DRAFT,
    FINANCE_ACTIONS.TRANSACTION_DELETE_DRAFT,
    FINANCE_ACTIONS.TRANSACTION_REVIEW,
    FINANCE_ACTIONS.TRANSACTION_POST,
    FINANCE_ACTIONS.JOURNAL_REVERSE,
    FINANCE_ACTIONS.REPORT_READ,
    FINANCE_ACTIONS.PERIOD_CLOSE,
    FINANCE_ACTIONS.PAYOUT_APPROVE,
    FINANCE_ACTIONS.OWN_PAYOUT_READ,
  ]),
  [FINANCE_ROLES.RECEPTIONIST]: new Set([
    FINANCE_ACTIONS.VIEW,
    FINANCE_ACTIONS.TRANSACTION_CREATE,
    FINANCE_ACTIONS.TRANSACTION_READ,
    FINANCE_ACTIONS.TRANSACTION_EDIT_DRAFT,
    FINANCE_ACTIONS.TRANSACTION_DELETE_DRAFT,
    FINANCE_ACTIONS.REPORT_READ,
  ]),
  [FINANCE_ROLES.CONSULTANT]: new Set([
    FINANCE_ACTIONS.VIEW,
    FINANCE_ACTIONS.OWN_PAYOUT_READ,
  ]),
})

/**
 * Check whether a user can perform a finance action.
 *
 * @param {{ roles?: string[], id?: string } | null | undefined} user
 * @param {string} action
 * @param {{ consultantId?: string, createdBy?: string } | null | undefined} [record]
 * @returns {boolean}
 */
export function canFinance(user, action, record = null) {
  const roles = Array.isArray(user?.roles) ? user.roles : []

  for (const role of roles) {
    const allowed = FINANCE_ROLE_MATRIX[role]
    if (!allowed?.has(action)) continue

    if (role === FINANCE_ROLES.CONSULTANT && action === FINANCE_ACTIONS.OWN_PAYOUT_READ) {
      return Boolean(record?.consultantId && user?.id === record.consultantId)
    }

    if (
      role === FINANCE_ROLES.RECEPTIONIST
      && action === FINANCE_ACTIONS.TRANSACTION_READ
      && record?.consultantId
    ) {
      return true
    }

    return true
  }

  return false
}

/**
 * Require a finance permission.
 *
 * @param {{ roles?: string[], id?: string } | null | undefined} user
 * @param {string} action
 * @param {{ consultantId?: string, createdBy?: string } | null | undefined} [record]
 * @throws {FinanceAuthorizationError}
 * @returns {true}
 */
export function requireFinance(user, action, record = null) {
  if (!canFinance(user, action, record)) {
    throw new FinanceAuthorizationError(`Not allowed to perform action '${action}'.`, {
      code: 'FINANCE_FORBIDDEN',
      meta: {
        action,
        userId: user?.id || null,
        roles: Array.isArray(user?.roles) ? user.roles : [],
      },
    })
  }

  return true
}
