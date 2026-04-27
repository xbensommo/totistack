/**
 * @file src/apps/ecommerce/services/orders.service.js
 * @description Orders and fulfillment actions.
 */

import { commitCollectionUpdate, requireEntityId } from './ecommerce-core-actions.js'
import { EcommerceAppError } from '../utils/ecommerce.errors.js'

/**
 * @param {{ ordersCollection?: any, actionModal?: { requestEcommerceAction: Function }, notificationService?: any, now?: () => Date }} deps
 */
export function createOrdersService(deps = {}) {
  const { ordersCollection, actionModal, notificationService, now = () => new Date() } = deps

  return {
    /**
     * @param {Record<string, any>} order
     * @returns {{ allowed: boolean, reason: string | null }}
     */
    canCancelOrder(order = {}) {
      const blockedStatuses = new Set(['cancelled', 'delivered', 'refunded'])
      const blockedFulfillmentStatuses = new Set(['shipped', 'delivered'])

      if (blockedStatuses.has(order.orderStatus)) {
        return { allowed: false, reason: `Order is already ${order.orderStatus}.` }
      }

      if (blockedFulfillmentStatuses.has(order.fulfillmentStatus)) {
        return { allowed: false, reason: `Order is already ${order.fulfillmentStatus}.` }
      }

      return { allowed: true, reason: null }
    },

    /**
     * @param {Record<string, any>} order
     * @param {{ reason?: string, actorId?: string }} [options]
     */
    async cancelOrder(order, options = {}) {
      const orderId = requireEntityId(order, 'order')
      const state = this.canCancelOrder(order)

      if (!state.allowed) {
        throw new EcommerceAppError('Order cannot be cancelled.', {
          code: 'ecommerce/order-not-cancellable',
          meta: { reason: state.reason, orderId },
        })
      }

      const decision = await actionModal?.requestEcommerceAction?.({
        intent: 'cancel-order',
        title: 'Cancel order',
        message: `Cancel order ${order?.orderNumber || ''}? This may affect payment and fulfillment state.`,
        confirmLabel: 'Cancel order',
        tone: 'danger',
        meta: { orderId },
      })

      if (!decision?.confirmed) {
        return { ok: false, skipped: true, reason: decision?.reason || 'cancelled' }
      }

      const payload = {
        ...order,
        orderStatus: 'cancelled',
        cancelledAt: now().toISOString(),
        updatedAt: now().toISOString(),
        updatedBy: options.actorId || null,
        cancellationReason: options.reason || null,
      }

      if (ordersCollection?.actions) {
        await commitCollectionUpdate(ordersCollection.actions, orderId, payload)
      }

      if (notificationService?.isConfigured?.()) {
        await notificationService.emitOrderCancelled({
          order: payload,
          reason: options.reason || null,
          actorId: options.actorId || null,
        })
      }

      return { ok: true, order: payload }
    },

    /**
     * @param {Record<string, any>} order
     * @param {{ actorId?: string }} [options]
     */
    async markPacked(order, options = {}) {
      const orderId = requireEntityId(order, 'order')
      const payload = {
        ...order,
        fulfillmentStatus: 'packed',
        packedAt: now().toISOString(),
        updatedAt: now().toISOString(),
        updatedBy: options.actorId || null,
      }

      if (ordersCollection?.actions) {
        await commitCollectionUpdate(ordersCollection.actions, orderId, payload)
      }

      return { ok: true, order: payload }
    },
  }
}
