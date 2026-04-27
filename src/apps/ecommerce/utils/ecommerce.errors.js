/**
 * @file src/apps/ecommerce/utils/ecommerce.errors.js
 * @description Safe error utilities for ecommerce app.
 */

export class EcommerceAppError extends Error {
  /**
   * @param {string} message
   * @param {{ code?: string, cause?: unknown, meta?: any }} [options]
   */
  constructor(message, options = {}) {
    super(message)
    this.name = 'EcommerceAppError'
    this.code = options.code || 'ECOMMERCE_APP_ERROR'
    this.cause = options.cause
    this.meta = options.meta || null
  }
}

/**
 * @param {unknown} error
 * @returns {string}
 */
export function getFriendlyEcommerceMessage(error) {
  switch (error?.code) {
    case 'ecommerce/product-id-required':
      return 'The selected product is missing its record id.'
    case 'ecommerce/order-not-cancellable':
      return 'This order can no longer be cancelled in its current state.'
    case 'ecommerce/insufficient-stock':
      return 'There is not enough stock available for this action.'
    case 'ecommerce/action-modal-missing':
      return 'A confirmation flow is required before this action can continue.'
    case 'ecommerce/root-store-actions-missing':
      return 'This ecommerce app is not yet connected to centralized collection actions in the root store.'
    case 'ecommerce/checkout-not-ready':
      return 'The checkout is incomplete. Complete the required fields and try again.'
    case 'ecommerce/payment-method-unsupported':
      return 'That payment method is not supported for this store or country setup.'
    default:
      return error?.message || 'Something went wrong.'
  }
}

/**
 * @param {unknown} error
 * @param {string} [fallback='Something went wrong.']
 * @returns {{ code: string, message: string, friendlyMessage: string, cause: unknown, meta: any }}
 */
export function normalizeEcommerceError(error, fallback = 'Something went wrong.') {
  return {
    code: error?.code || 'ecommerce/unknown',
    message: error?.message || fallback,
    friendlyMessage: getFriendlyEcommerceMessage(error),
    cause: error,
    meta: error?.meta || null,
  }
}
