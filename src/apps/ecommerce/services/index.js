/**
 * @file src/apps/ecommerce/services/index.js
 * @description Factory for ecommerce app services.
 */

import { createEcommerceActionModal } from './create-ecommerce-action-modal.js'
import { createCatalogService } from './catalog.service.js'
import { createPricingService } from './pricing.service.js'
import { createInventoryService } from './inventory.service.js'
import { createCartService } from './cart.service.js'
import { createCheckoutService } from './checkout.service.js'
import { createOrdersService } from './orders.service.js'
import { createReturnsService } from './returns.service.js'
import { createPaymentService } from './payment.service.js'
import { createNotificationService } from './notification.service.js'
import { createAnalyticsService } from './analytics.service.js'
import { createEcommerceRootStoreBridge } from './ecommerce-root-store.js'

/**
 * Create ecommerce services.
 *
 * Primary integration target is the centralized Totistack root store,
 * where shard-provider collection actions live.
 *
 * @param {Record<string, any>} context
 */
export function createEcommerceServices(context = {}) {
  const rootBridge = createEcommerceRootStoreBridge(context.rootStore)
  const actionModal = createEcommerceActionModal({
    request: context.requestActionModal,
    fallbackAutoConfirm: Boolean(context.devAutoConfirmActions),
  })

  const notificationsFeatureService = context.notificationsService
    || context.rootStore?.notificationsService
    || context.rootStore?.services?.notifications
    || null

  const notificationService = createNotificationService({
    notificationsCollection: rootBridge.collection('notifications'),
    notificationsFeatureService,
    now: context.now,
  })
  const paymentService = createPaymentService({
    paymentTransactionsCollection: rootBridge.collection('paymentTransactions'),
    now: context.now,
  })
  const pricingService = createPricingService({ now: context.now })
  const inventoryService = createInventoryService({
    inventoryMovementsCollection: rootBridge.collection('inventoryMovements'),
    now: context.now,
  })
  const cartService = createCartService({ pricingService })
  const checkoutService = createCheckoutService({
    cartService,
    ordersCollection: rootBridge.collection('orders'),
    paymentService,
    notificationService,
    now: context.now,
  })
  const catalogService = createCatalogService({
    productsCollection: rootBridge.collection('products'),
    productVariantsCollection: rootBridge.collection('productVariants'),
    actionModal,
    notificationService,
    now: context.now,
  })
  const ordersService = createOrdersService({
    ordersCollection: rootBridge.collection('orders'),
    actionModal,
    notificationService,
    now: context.now,
  })
  const returnsService = createReturnsService({
    returnsCollection: rootBridge.collection('returns'),
    actionModal,
    notificationService,
    now: context.now,
  })
  const analyticsService = createAnalyticsService()

  return {
    rootBridge,
    actionModal,
    notificationService,
    paymentService,
    pricingService,
    inventoryService,
    cartService,
    checkoutService,
    catalogService,
    ordersService,
    returnsService,
    analyticsService,
  }
}
