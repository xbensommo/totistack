/**
 * @file src/apps/ecommerce/services/checkout.service.js
 * @description Checkout validation and order creation.
 */

import { createCollectionRecord } from './ecommerce-core-actions.js'
import { EcommerceAppError } from '../utils/ecommerce.errors.js'

/**
 * @param {{ cartService?: any, ordersCollection?: any, paymentService?: any, notificationService?: any, now?: () => Date }} deps
 */
export function createCheckoutService(deps = {}) {
  const {
    cartService,
    ordersCollection,
    paymentService,
    notificationService,
    now = () => new Date(),
  } = deps

  return {
    /**
     * @param {any} cart
     * @returns {boolean}
     */
    cartRequiresShipping(cart = {}) {
      const lineItems = Array.isArray(cart?.lineItems) ? cart.lineItems : []
      if (!lineItems.length) return false

      return lineItems.some((item) => {
        const productType = item?.productType || item?.product?.type || item?.variant?.productType || 'product'
        const deliveryMode = item?.deliveryMode || item?.variant?.deliveryMode || item?.product?.fulfillmentType || 'shipping'
        return productType !== 'service' && deliveryMode !== 'digital'
      })
    },

    /**
     * @param {{ email?: string, billingAddress?: any, shippingAddress?: any, paymentMethod?: string, cart?: any, customer?: any, store?: any }} checkout
     */
    validateCheckoutReadiness(checkout = {}) {
      const issues = []
      const requiresShipping = this.cartRequiresShipping(checkout.cart)

      if (!checkout.email) issues.push('Customer email is required.')
      if (!checkout.billingAddress) issues.push('Billing address is required.')
      if (requiresShipping && !checkout.shippingAddress) issues.push('Shipping address is required.')
      if (!checkout.paymentMethod) issues.push('Payment method is required.')
      if (!checkout.cart?.lineItems?.length) issues.push('Cart must contain at least one item.')

      if (checkout.paymentMethod && paymentService) {
        const paymentValidation = paymentService.validatePaymentMethod(checkout.paymentMethod, {
          countryCode: checkout.store?.countryCode || 'NA',
          channel: checkout.store?.channel || checkout.source || 'storefront',
        })
        if (!paymentValidation.supported) {
          issues.push('Selected payment method is not supported for this store.')
        }
      }

      return {
        ready: issues.length === 0,
        issues,
        requiresShipping,
      }
    },

    /**
     * @param {{ storeCode?: string }} [input]
     */
    buildOrderNumber(input = {}) {
      const date = now()
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      const stamp = String(date.getUTCHours())
        + String(date.getUTCMinutes()).padStart(2, '0')
        + String(date.getUTCSeconds()).padStart(2, '0')
      const prefix = input.storeCode ? String(input.storeCode).toUpperCase() : 'ORD'
      return `${prefix}-${year}${month}${day}-${stamp}`
    },

    /**
     * @param {{ cart: any, customer?: any, checkout: any, store?: any }} input
     */
    createOrderFromCheckout(input = {}) {
      const validation = this.validateCheckoutReadiness({
        ...input.checkout,
        cart: input.cart,
        customer: input.customer,
        store: input.store,
      })

      if (!validation.ready) {
        throw new EcommerceAppError('Checkout is not ready.', {
          code: 'ecommerce/checkout-not-ready',
          meta: validation,
        })
      }

      const totals = cartService.buildCartTotals(input.cart, input.customer)
      const orderNumber = this.buildOrderNumber({ storeCode: input.store?.code })
      const paymentSnapshot = paymentService
        ? paymentService.buildPaymentSnapshot({
          method: input.checkout.paymentMethod,
          amount: totals.summary.grandTotal,
          currency: input.cart?.currency || input.store?.currency || 'NAD',
          orderNumber,
          customer: input.customer,
          store: input.store,
        })
        : null
      const paymentStatus = paymentService
        ? paymentService.determineInitialPaymentStatus(input.checkout.paymentMethod)
        : 'pending'
      const requiresShipping = validation.requiresShipping

      return {
        storeId: input.store?.id || null,
        orderNumber,
        customerId: input.customer?.id || null,
        currency: input.cart?.currency || input.store?.currency || 'NAD',
        email: input.checkout.email,
        orderStatus: 'placed',
        paymentStatus,
        paymentMethod: paymentSnapshot?.method || input.checkout.paymentMethod || null,
        paymentSnapshot,
        fulfillmentStatus: requiresShipping ? 'unfulfilled' : 'not_required',
        returnStatus: 'none',
        lineItemsSnapshot: totals.items,
        totalsSnapshot: totals.summary,
        billingAddress: input.checkout.billingAddress,
        shippingAddress: requiresShipping ? input.checkout.shippingAddress : null,
        customerSnapshot: input.customer || null,
        source: input.checkout.source || 'storefront',
        sourceChannel: input.checkout.channel || input.checkout.source || 'storefront',
        placedAt: now().toISOString(),
        createdAt: now().toISOString(),
        updatedAt: now().toISOString(),
      }
    },

    /**
     * @param {{ cart: any, customer?: any, checkout: any, store?: any, actorId?: string }} input
     */
    async placeOrder(input = {}) {
      const order = this.createOrderFromCheckout(input)
      const persisted = ordersCollection?.actions
        ? await createCollectionRecord(ordersCollection.actions, order)
        : order
      const finalOrder = {
        ...order,
        ...(persisted && typeof persisted === 'object' ? persisted : {}),
      }

      if (paymentService) {
        await paymentService.createPaymentTransaction({
          orderId: finalOrder.id || null,
          orderNumber: finalOrder.orderNumber,
          amount: finalOrder.totalsSnapshot?.grandTotal || 0,
          currency: finalOrder.currency,
          method: finalOrder.paymentMethod,
          store: input.store,
          actorId: input.actorId || null,
        })
      }

      if (notificationService?.isConfigured?.()) {
        await notificationService.emitOrderPlaced({ order: finalOrder })
        if (finalOrder.paymentStatus === 'awaiting_confirmation') {
          await notificationService.emitPaymentAwaitingConfirmation({ order: finalOrder })
        }
      }

      return finalOrder
    },
  }
}
