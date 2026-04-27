/**
 * @file src/apps/ecommerce/services/create-ecommerce-action-modal.js
 * @description Action modal adapter for ecommerce workflows.
 */

import { EcommerceAppError } from '../utils/ecommerce.errors.js'

/**
 * Create an ecommerce action modal requester.
 *
 * This adapter intentionally stays thin so it can connect to any existing
 * Totistack confirm modal implementation without rewriting feature code.
 *
 * @param {{
 *   request?: (payload: Record<string, any>) => Promise<any>,
 *   fallbackAutoConfirm?: boolean,
 * }} options
 * @returns {{ requestEcommerceAction: (payload: Record<string, any>) => Promise<{confirmed: boolean, reason: string | null}> }}
 */
export function createEcommerceActionModal(options = {}) {
  const { request, fallbackAutoConfirm = false } = options

  return {
    async requestEcommerceAction(payload = {}) {
      if (typeof request === 'function') {
        const result = await request({
          kind: 'ecommerce-action',
          tone: payload.tone || 'default',
          title: payload.title || 'Confirm action',
          message: payload.message || 'Please confirm this action.',
          confirmLabel: payload.confirmLabel || 'Confirm',
          cancelLabel: payload.cancelLabel || 'Cancel',
          intent: payload.intent || 'generic',
          meta: payload.meta || null,
        })

        return {
          confirmed: Boolean(result?.confirmed),
          reason: result?.reason || null,
        }
      }

      if (fallbackAutoConfirm) {
        return { confirmed: true, reason: null }
      }

      throw new EcommerceAppError('No ecommerce action modal adapter is configured.', {
        code: 'ecommerce/action-modal-missing',
      })
    },
  }
}
