/**
 * @file src/apps/ecommerce/services/notification.service.js
 * @description Ecommerce notification integration bridge.
 */

import { createCollectionRecord } from './ecommerce-core-actions.js'

/**
 * @param {{ notificationsCollection?: any, notificationsFeatureService?: any, now?: () => Date }} deps
 */
export function createNotificationService(deps = {}) {
  const {
    notificationsCollection,
    notificationsFeatureService,
    now = () => new Date(),
  } = deps

  return {
    /**
     * @returns {boolean}
     */
    isConfigured() {
      return Boolean(
        notificationsCollection?.actions
        || notificationsFeatureService?.notify
        || notificationsFeatureService?.createNotification
        || notificationsFeatureService?.sendNotification,
      )
    },

    /**
     * @param {Record<string, any>} notification
     */
    async createNotification(notification = {}) {
      const payload = {
        title: notification.title || 'Commerce update',
        message: notification.message || 'A commerce event needs attention.',
        type: notification.type || 'info',
        category: notification.category || 'ecommerce',
        sourceApp: 'ecommerce',
        targetType: notification.targetType || null,
        targetId: notification.targetId || null,
        channels: Array.isArray(notification.channels) ? notification.channels : ['in_app'],
        recipientRole: notification.recipientRole || null,
        recipientIds: Array.isArray(notification.recipientIds) ? notification.recipientIds : [],
        status: notification.status || 'unread',
        meta: notification.meta || null,
        createdAt: notification.createdAt || now().toISOString(),
      }

      if (typeof notificationsFeatureService?.notify === 'function') {
        return notificationsFeatureService.notify(payload)
      }
      if (typeof notificationsFeatureService?.createNotification === 'function') {
        return notificationsFeatureService.createNotification(payload)
      }
      if (typeof notificationsFeatureService?.sendNotification === 'function') {
        return notificationsFeatureService.sendNotification(payload)
      }
      if (notificationsCollection?.actions) {
        return createCollectionRecord(notificationsCollection.actions, payload)
      }

      return payload
    },

    /**
     * @param {{ product?: any, actorId?: string }} input
     */
    async emitCatalogPublished(input = {}) {
      return this.createNotification({
        title: 'Product published',
        message: `${input.product?.name || 'Product'} is now live in the catalog.`,
        type: 'success',
        category: 'catalog',
        targetType: 'product',
        targetId: input.product?.id || null,
        recipientRole: 'catalog_manager',
        meta: {
          actorId: input.actorId || null,
          productSlug: input.product?.slug || null,
        },
      })
    },

    /**
     * @param {{ order?: any }} input
     */
    async emitOrderPlaced(input = {}) {
      const order = input.order || {}
      return this.createNotification({
        title: 'New order placed',
        message: `Order ${order.orderNumber || ''} was placed with ${order.paymentSnapshot?.methodLabel || 'payment'} selected.`,
        type: 'info',
        category: 'orders',
        targetType: 'order',
        targetId: order.id || null,
        recipientRole: 'order_manager',
        channels: ['in_app', 'email'],
        meta: {
          amount: order.totalsSnapshot?.grandTotal || 0,
          paymentMethod: order.paymentMethod || null,
        },
      })
    },

    /**
     * @param {{ order?: any, reason?: string, actorId?: string }} input
     */
    async emitOrderCancelled(input = {}) {
      const order = input.order || {}
      return this.createNotification({
        title: 'Order cancelled',
        message: `Order ${order.orderNumber || ''} was cancelled${input.reason ? `: ${input.reason}` : '.'}`,
        type: 'warning',
        category: 'orders',
        targetType: 'order',
        targetId: order.id || null,
        recipientRole: 'support_agent',
        meta: {
          actorId: input.actorId || null,
          reason: input.reason || null,
        },
      })
    },

    /**
     * @param {{ returnRequest?: any, actorId?: string }} input
     */
    async emitReturnApproved(input = {}) {
      const returnRequest = input.returnRequest || {}
      return this.createNotification({
        title: 'Return approved',
        message: `Return request ${returnRequest.id || ''} is approved and ready for refund workflow.`,
        type: 'success',
        category: 'returns',
        targetType: 'return',
        targetId: returnRequest.id || null,
        recipientRole: 'finance_manager',
        meta: {
          orderId: returnRequest.orderId || null,
          actorId: input.actorId || null,
        },
      })
    },

    /**
     * @param {{ order?: any }} input
     */
    async emitPaymentAwaitingConfirmation(input = {}) {
      const order = input.order || {}
      return this.createNotification({
        title: 'Payment awaiting confirmation',
        message: `Order ${order.orderNumber || ''} requires payment confirmation for ${order.paymentSnapshot?.methodLabel || 'the selected method'}.`,
        type: 'warning',
        category: 'payments',
        targetType: 'order',
        targetId: order.id || null,
        recipientRole: 'finance_manager',
        channels: ['in_app', 'email'],
        meta: {
          paymentMethod: order.paymentMethod || null,
          paymentStatus: order.paymentStatus || null,
        },
      })
    },
  }
}

export default createNotificationService
