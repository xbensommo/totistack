/**
 * @file src/apps/ecommerce/services/payment.service.js
 * @description Namibia-first payment service for cards, EFT, and DPO Pay.
 */

import { createCollectionRecord } from './ecommerce-core-actions.js'
import { EcommerceAppError } from '../utils/ecommerce.errors.js'

const PAYMENT_METHODS = {
  card: {
    code: 'card',
    label: 'Card',
    provider: 'Card gateway',
    countries: ['*'],
    channels: ['storefront', 'admin'],
    requiresProof: false,
    kind: 'online',
    description: 'Instant card checkout for Visa and Mastercard.',
  },
  eft: {
    code: 'eft',
    label: 'EFT',
    provider: 'Bank EFT',
    countries: ['NA'],
    channels: ['storefront', 'admin'],
    requiresProof: true,
    kind: 'offline',
    description: 'Bank transfer with manual payment verification.',
  },
  dpo_pay: {
    code: 'dpo_pay',
    label: 'DPO Pay',
    provider: 'DPO Pay',
    countries: ['NA', 'ZA', 'BW', 'ZM'],
    channels: ['storefront', 'admin'],
    requiresProof: false,
    kind: 'gateway',
    description: 'Regional gateway flow suited to southern African commerce operations.',
  },
}

const PAYMENT_METHOD_ALIASES = {
  card: 'card',
  cards: 'card',
  mastercard: 'card',
  visa: 'card',
  eft: 'eft',
  transfer: 'eft',
  bank_transfer: 'eft',
  banktransfer: 'eft',
  dpopay: 'dpo_pay',
  'dpo pay': 'dpo_pay',
  'ddpo pay': 'dpo_pay',
  dpo: 'dpo_pay',
  dpo_pay: 'dpo_pay',
}

/**
 * @param {{ paymentTransactionsCollection?: any, now?: () => Date }} deps
 */
export function createPaymentService(deps = {}) {
  const {
    paymentTransactionsCollection,
    now = () => new Date(),
  } = deps

  return {
    /**
     * @param {string} method
     * @returns {string | null}
     */
    normalizePaymentMethod(method) {
      if (!method) return null
      const key = String(method).trim().toLowerCase().replace(/\s+/g, ' ')
      return PAYMENT_METHOD_ALIASES[key] || PAYMENT_METHOD_ALIASES[key.replace(/\s/g, '')] || null
    },

    /**
     * @param {{ countryCode?: string, channel?: string }} [options]
     * @returns {Array<Record<string, any>>}
     */
    getSupportedMethods(options = {}) {
      const countryCode = String(options.countryCode || 'NA').toUpperCase()
      const channel = options.channel || 'storefront'

      return Object.values(PAYMENT_METHODS).filter((method) => {
        const countrySupported = method.countries.includes('*') || method.countries.includes(countryCode)
        const channelSupported = !Array.isArray(method.channels) || method.channels.includes(channel)
        return countrySupported && channelSupported
      })
    },

    /**
     * @param {string} method
     * @param {{ countryCode?: string, channel?: string }} [options]
     * @returns {{ supported: boolean, normalizedMethod: string | null, method: Record<string, any> | null }}
     */
    validatePaymentMethod(method, options = {}) {
      const normalizedMethod = this.normalizePaymentMethod(method)
      if (!normalizedMethod) {
        return { supported: false, normalizedMethod: null, method: null }
      }

      const supportedMethod = this.getSupportedMethods(options).find((item) => item.code === normalizedMethod) || null

      return {
        supported: Boolean(supportedMethod),
        normalizedMethod,
        method: supportedMethod,
      }
    },

    /**
     * @param {{ method?: string, amount?: number, currency?: string, orderNumber?: string, customer?: any, store?: any }} input
     * @returns {Record<string, any>}
     */
    buildPaymentSnapshot(input = {}) {
      const validation = this.validatePaymentMethod(input.method, {
        countryCode: input.store?.countryCode || 'NA',
        channel: input.store?.channel || 'storefront',
      })

      if (!validation.supported || !validation.method) {
        throw new EcommerceAppError('The selected payment method is not supported.', {
          code: 'ecommerce/payment-method-unsupported',
          meta: {
            method: input.method || null,
            countryCode: input.store?.countryCode || 'NA',
          },
        })
      }

      return {
        method: validation.normalizedMethod,
        methodLabel: validation.method.label,
        provider: validation.method.provider,
        amount: Number(Number(input.amount || 0).toFixed(2)),
        currency: input.currency || 'NAD',
        requiresProof: Boolean(validation.method.requiresProof),
        instructions: this.getPaymentInstructions(validation.normalizedMethod, {
          store: input.store,
          orderNumber: input.orderNumber,
        }),
        customerEmail: input.customer?.email || null,
        createdAt: now().toISOString(),
      }
    },

    /**
     * @param {string} method
     * @param {{ store?: any, orderNumber?: string }} [context]
     * @returns {string}
     */
    getPaymentInstructions(method, context = {}) {
      switch (this.normalizePaymentMethod(method)) {
        case 'eft':
          return `Use EFT for order ${context.orderNumber || 'pending'} and verify bank proof before marking the order as paid.`
        case 'dpo_pay':
          return 'Redirect the customer to DPO Pay and confirm the transaction callback before fulfillment.'
        case 'card':
        default:
          return 'Capture or authorize the card payment before fulfillment proceeds.'
      }
    },

    /**
     * @param {string} method
     * @returns {string}
     */
    determineInitialPaymentStatus(method) {
      switch (this.normalizePaymentMethod(method)) {
        case 'eft':
          return 'awaiting_confirmation'
        case 'card':
        case 'dpo_pay':
        default:
          return 'pending'
      }
    },

    /**
     * @param {{ orderId?: string, orderNumber?: string, amount?: number, currency?: string, method?: string, status?: string, externalReference?: string, actorId?: string }} payment
     */
    async createPaymentTransaction(payment = {}) {
      const paymentSnapshot = this.buildPaymentSnapshot({
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        orderNumber: payment.orderNumber,
        store: payment.store,
      })

      const payload = {
        orderId: payment.orderId || null,
        orderNumber: payment.orderNumber || null,
        method: paymentSnapshot.method,
        provider: paymentSnapshot.provider,
        amount: paymentSnapshot.amount,
        currency: paymentSnapshot.currency,
        status: payment.status || this.determineInitialPaymentStatus(payment.method),
        externalReference: payment.externalReference || null,
        instructions: paymentSnapshot.instructions,
        createdAt: now().toISOString(),
        createdBy: payment.actorId || null,
      }

      if (paymentTransactionsCollection?.actions) {
        await createCollectionRecord(paymentTransactionsCollection.actions, payload)
      }

      return payload
    },

    /**
     * @returns {Array<Record<string, any>>}
     */
    getPublicCheckoutOptions() {
      return this.getSupportedMethods({ countryCode: 'NA', channel: 'storefront' }).map((method) => ({
        code: method.code,
        label: method.label,
        provider: method.provider,
        description: method.description,
        requiresProof: method.requiresProof,
      }))
    },
  }
}

export default createPaymentService
