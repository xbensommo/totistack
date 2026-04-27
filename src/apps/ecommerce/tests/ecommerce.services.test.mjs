import test from 'node:test'
import assert from 'node:assert/strict'

import { createPricingService } from '../services/pricing.service.js'
import { createCartService } from '../services/cart.service.js'
import { createInventoryService } from '../services/inventory.service.js'
import { createCheckoutService } from '../services/checkout.service.js'
import { createOrdersService } from '../services/orders.service.js'
import { createCatalogService } from '../services/catalog.service.js'
import { createPaymentService } from '../services/payment.service.js'
import { createNotificationService } from '../services/notification.service.js'
import { resolveCollectionActions } from '../services/ecommerce-root-store.js'

test('pricingService resolves percentage discount correctly', () => {
  const pricingService = createPricingService({
    now: () => new Date('2026-04-16T10:00:00.000Z'),
  })

  const result = pricingService.resolveSellPrice(
    { price: 100, compareAtPrice: 120 },
    { customerGroupId: 'retail' },
    [
      {
        status: 'active',
        ruleType: 'percentage',
        value: 10,
        startsAt: '2026-04-01T00:00:00.000Z',
        endsAt: '2026-04-30T00:00:00.000Z',
      },
    ],
  )

  assert.equal(result.finalPrice, 90)
  assert.equal(result.discounted, true)
})

test('cartService builds totals with tax and shipping', () => {
  const pricingService = createPricingService()
  const cartService = createCartService({ pricingService })

  const result = cartService.buildCartTotals({
    lineItems: [
      {
        quantity: 2,
        variant: { price: 50 },
        rules: [],
      },
    ],
    shippingChoice: { amount: 20 },
  })

  assert.equal(result.summary.subtotal, 100)
  assert.equal(result.summary.shipping, 20)
  assert.equal(result.summary.tax, 15)
  assert.equal(result.summary.grandTotal, 135)
})

test('inventoryService computes reserve movement correctly', () => {
  const inventoryService = createInventoryService()
  const result = inventoryService.computeInventoryDelta(
    { onHand: 10, reserved: 1 },
    { type: 'reserve', quantity: 3 },
  )

  assert.deepEqual(result.nextState, { onHand: 10, reserved: 4 })
})

test('inventoryService rejects reserve above available stock', () => {
  const inventoryService = createInventoryService()

  assert.throws(() => {
    inventoryService.computeInventoryDelta(
      { onHand: 5, reserved: 4 },
      { type: 'reserve', quantity: 3 },
    )
  }, /Cannot reserve more than is available/)
})

test('paymentService normalizes ddpo pay to dpo_pay', () => {
  const paymentService = createPaymentService()
  assert.equal(paymentService.normalizePaymentMethod('ddpo pay'), 'dpo_pay')
})

test('paymentService exposes Namibia-first checkout methods', () => {
  const paymentService = createPaymentService()
  const methods = paymentService.getPublicCheckoutOptions().map((item) => item.code)
  assert.deepEqual(methods, ['card', 'eft', 'dpo_pay'])
})

test('checkoutService creates order only when checkout is ready', () => {
  const pricingService = createPricingService()
  const cartService = createCartService({ pricingService })
  const paymentService = createPaymentService({
    now: () => new Date('2026-04-16T10:00:00.000Z'),
  })
  const checkoutService = createCheckoutService({
    cartService,
    paymentService,
    now: () => new Date('2026-04-16T10:00:00.000Z'),
  })

  const order = checkoutService.createOrderFromCheckout({
    cart: {
      lineItems: [
        {
          quantity: 1,
          variant: { price: 100 },
          rules: [],
        },
      ],
      shippingChoice: { amount: 10 },
      currency: 'NAD',
    },
    customer: { id: 'cust-1', email: 'customer@example.com' },
    store: { id: 'store-1', code: 'TS', currency: 'NAD', countryCode: 'NA' },
    checkout: {
      email: 'customer@example.com',
      billingAddress: { line1: '123 Main' },
      shippingAddress: { line1: '123 Main' },
      paymentMethod: 'card',
      source: 'storefront',
    },
  })

  assert.equal(order.customerId, 'cust-1')
  assert.equal(order.paymentStatus, 'pending')
  assert.equal(order.fulfillmentStatus, 'unfulfilled')
  assert.equal(order.orderStatus, 'placed')
  assert.equal(order.paymentMethod, 'card')
  assert.match(order.orderNumber, /^TS-/)
})

test('checkoutService does not require shipping address for service orders', () => {
  const pricingService = createPricingService()
  const cartService = createCartService({ pricingService })
  const paymentService = createPaymentService({
    now: () => new Date('2026-04-16T10:00:00.000Z'),
  })
  const checkoutService = createCheckoutService({
    cartService,
    paymentService,
    now: () => new Date('2026-04-16T10:00:00.000Z'),
  })

  const order = checkoutService.createOrderFromCheckout({
    cart: {
      lineItems: [
        {
          quantity: 1,
          productType: 'service',
          deliveryMode: 'service',
          variant: { price: 200 },
          rules: [],
        },
      ],
      currency: 'NAD',
    },
    customer: { id: 'cust-2', email: 'service@example.com' },
    store: { id: 'store-1', code: 'TS', currency: 'NAD', countryCode: 'NA' },
    checkout: {
      email: 'service@example.com',
      billingAddress: { line1: '123 Main' },
      paymentMethod: 'eft',
      source: 'storefront',
    },
  })

  assert.equal(order.fulfillmentStatus, 'not_required')
  assert.equal(order.shippingAddress, null)
  assert.equal(order.paymentStatus, 'awaiting_confirmation')
})

test('checkoutService placeOrder emits order and payment notifications', async () => {
  const pricingService = createPricingService()
  const cartService = createCartService({ pricingService })
  const paymentTransactions = []
  const notifications = []
  const paymentService = createPaymentService({
    paymentTransactionsCollection: {
      actions: {
        add: async (payload) => {
          paymentTransactions.push(payload)
          return payload
        },
      },
    },
    now: () => new Date('2026-04-16T10:00:00.000Z'),
  })
  const notificationService = createNotificationService({
    notificationsCollection: {
      actions: {
        add: async (payload) => {
          notifications.push(payload)
          return payload
        },
      },
    },
    now: () => new Date('2026-04-16T10:00:00.000Z'),
  })
  const checkoutService = createCheckoutService({
    cartService,
    paymentService,
    notificationService,
    ordersCollection: {
      actions: {
        add: async (payload) => ({ id: 'ord-1', ...payload }),
      },
    },
    now: () => new Date('2026-04-16T10:00:00.000Z'),
  })

  const order = await checkoutService.placeOrder({
    cart: {
      lineItems: [{ quantity: 1, variant: { price: 100 }, rules: [] }],
      currency: 'NAD',
    },
    customer: { id: 'cust-1', email: 'customer@example.com' },
    store: { id: 'store-1', code: 'TS', currency: 'NAD', countryCode: 'NA' },
    checkout: {
      email: 'customer@example.com',
      billingAddress: { line1: '123 Main' },
      shippingAddress: { line1: '123 Main' },
      paymentMethod: 'eft',
      source: 'storefront',
    },
  })

  assert.equal(order.id, 'ord-1')
  assert.equal(paymentTransactions.length, 1)
  assert.equal(notifications.length, 2)
  assert.equal(notifications[0].category, 'orders')
  assert.equal(notifications[1].category, 'payments')
})

test('ordersService blocks cancellation after shipment', async () => {
  const service = createOrdersService({
    actionModal: {
      requestEcommerceAction: async () => ({ confirmed: true }),
    },
  })

  await assert.rejects(
    () => service.cancelOrder({ id: 'ord-1', orderNumber: 'ORD-1', fulfillmentStatus: 'shipped' }),
    /Order cannot be cancelled/,
  )
})

test('catalogService validates publish readiness with media and variants', () => {
  const service = createCatalogService({
    productVariantsCollection: {
      items: [{ productId: 'prod-1', price: 50, stockQty: 4, stockTracking: true }],
    },
  })

  const result = service.validatePublishReadiness(
    {
      id: 'prod-1',
      name: 'Desk',
      slug: 'desk',
      fullDescription: 'Wood desk',
      categoryIds: ['office'],
      media: [{ url: 'https://example.com/desk.jpg' }],
    },
    service.getVariantsForProduct('prod-1'),
  )

  assert.equal(result.ready, true)
})

test('catalogService allows service publication without stock quantity', () => {
  const service = createCatalogService({
    productVariantsCollection: {
      items: [{ productId: 'svc-1', price: 500, stockTracking: false, deliveryMode: 'service' }],
    },
  })

  const result = service.validatePublishReadiness(
    {
      id: 'svc-1',
      name: 'Consultation',
      slug: 'consultation',
      type: 'service',
      fullDescription: 'Business consultation',
      categoryIds: ['services'],
    },
    service.getVariantsForProduct('svc-1'),
  )

  assert.equal(result.ready, true)
})

test('root-store resolver returns centralized collection actions', () => {
  const actions = { fetchInitialPage() {} }
  const rootStore = {
    ordersActions: actions,
  }

  assert.equal(resolveCollectionActions(rootStore, 'orders'), actions)
})
