/**
 * @file src/apps/finance/services/createFinanceModule.js
 * @description High-level finance module assembly.
 */

import { createFinanceRepositories } from './createFinanceRepositories.js'
import { createFinanceCommandBus } from './createFinanceCommandBus.js'
import { createFinanceNotifications } from './createFinanceNotifications.js'
import * as reportService from './financeReportService.js'

function createBrowserConfirm() {
  return async ({ title, message, confirmText }) => {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const body = [title, message, confirmText ? `Action: ${confirmText}` : ''].filter(Boolean).join('\n\n')
      return window.confirm(body)
    }

    return true
  }
}

function createStoreUserResolver(store) {
  return () => (
    store?.auth?.user
    || store?.currentUser
    || store?.user
    || null
  )
}

/**
 * Assemble the finance module for Totistack runtime.
 *
 * @param {object} options
 * @param {object} [options.store]
 * @param {object} [options.repositories]
 * @param {() => ({ id?: string, roles?: string[] } | null)} [options.getCurrentUser]
 * @param {(context: { title: string, message: string, confirmText: string, tone?: string }) => Promise<boolean>} [options.confirm]
 * @param {{ handleEvent?: Function }|null} [options.notifications]
 * @returns {{ repositories: object, commands: object, reports: typeof reportService, getCurrentUser: Function, confirm: Function, notifications: object }}
 */
export function createFinanceModule({ store = null, repositories = null, getCurrentUser = null, confirm = null, notifications = null } = {}) {
  const resolvedRepositories = repositories || createFinanceRepositories({ store })
  const resolvedGetCurrentUser = getCurrentUser || createStoreUserResolver(store)
  const resolvedConfirm = confirm || createBrowserConfirm()

  const financeNotifications = createFinanceNotifications(notifications)
  const commands = createFinanceCommandBus({
    repositories: resolvedRepositories,
    getCurrentUser: resolvedGetCurrentUser,
    confirm: resolvedConfirm,
    notifications: financeNotifications,
  })

  return {
    repositories: resolvedRepositories,
    commands,
    reports: reportService,
    notifications: financeNotifications,
    getCurrentUser: resolvedGetCurrentUser,
    confirm: resolvedConfirm,
  }
}
