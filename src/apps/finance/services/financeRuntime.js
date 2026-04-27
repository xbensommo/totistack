/**
 * @file src/apps/finance/services/financeRuntime.js
 * @description Explicit runtime configuration for the finance app.
 */

import { buildFinanceDemoState } from './financeSampleData.js'

const RUNTIME_KEY = '__TOTISTACK_FINANCE_RUNTIME__'

/** @type {Record<string, any>} */
let runtimeConfig = {
  store: null,
  repositories: null,
  getCurrentUser: null,
  confirm: null,
  allowDemoMode: false,
  seedBuilder: buildFinanceDemoState,
}

/**
 * @param {Partial<typeof runtimeConfig>} options
 * @returns {typeof runtimeConfig}
 */
export function configureFinanceRuntime(options = {}) {
  runtimeConfig = {
    ...runtimeConfig,
    ...options,
  }

  if (typeof globalThis !== 'undefined') {
    globalThis[RUNTIME_KEY] = runtimeConfig
  }

  return runtimeConfig
}

/**
 * @returns {typeof runtimeConfig}
 */
export function getFinanceRuntime() {
  if (typeof globalThis !== 'undefined' && globalThis[RUNTIME_KEY]) {
    return {
      ...runtimeConfig,
      ...globalThis[RUNTIME_KEY],
    }
  }

  return runtimeConfig
}

export function clearFinanceRuntime() {
  runtimeConfig = {
    store: null,
    repositories: null,
    getCurrentUser: null,
    confirm: null,
    allowDemoMode: false,
    seedBuilder: buildFinanceDemoState,
  }

  if (typeof globalThis !== 'undefined' && globalThis[RUNTIME_KEY]) {
    delete globalThis[RUNTIME_KEY]
  }
}
