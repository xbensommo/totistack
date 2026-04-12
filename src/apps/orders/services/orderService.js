/**
 * @file orders/services/orderService.js
 * @description Orders service adapter built for the latest Totistack root-store flow.
 *
 * This service does not talk to Firestore directly.
 * It expects order collection actions to come from the root store, which is
 * assembled from src/generated/* and the single root shard-provider instance.
 */

import { useAppStore } from '@/stores/appStore'

/**
 * Friendly application error for order workflows.
 */
export class OrderError extends Error {
  /**
   * @param {string} message
   * @param {string} [code]
   * @param {unknown} [cause]
   */
  constructor(message, code = 'ORDER_ERROR', cause = null) {
    super(message)
    this.name = 'OrderError'
    this.code = code
    this.cause = cause
  }
}

/**
 * Resolve order collection actions from the root app store.
 *
 * @param {Record<string, any>} store
 * @returns {Record<string, Function>}
 */
function resolveOrderActions(store) {
  const actions =
    store?.ordersActions ||
    store?.orderActions ||
    store?.collectionsActions?.orders ||
    null

  if (!actions || typeof actions !== 'object') {
    throw new OrderError(
      'Order actions are not available on the root store.',
      'ORDER_ACTIONS_UNAVAILABLE'
    )
  }

  return actions
}

/**
 * @param {any} value
 * @returns {Date|null}
 */
function toDate(value) {
  if (!value) return null
  const date =
    value instanceof Date
      ? value
      : typeof value?.toDate === 'function'
        ? value.toDate()
        : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * @param {number} value
 * @returns {number}
 */
function toMoney(value) {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0
}

/**
 * Generate a readable order number.
 *
 * @returns {string}
 */
function createOrderNumber() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `ORD-${yyyy}${mm}${dd}-${random}`
}

/**
 * Normalize a cart item.
 *
 * @param {Record<string, any>} item
 * @returns {Record<string, any>}
 */
function normalizeItem(item) {
  const quantity = Math.max(1, Number(item?.quantity || 1))
  const price = toMoney(item?.price)
  const subtotal = toMoney(quantity * price)

  return {
    sku: item?.sku || null,
    productId: item?.productId || item?.id || null,
    title: item?.title || item?.name || 'Untitled item',
    quantity,
    price,
    subtotal,
    imageUrl: item?.imageUrl || null,
    metadata: item?.metadata || {},
  }
}

/**
 * Validate status transitions.
 *
 * @param {string} currentStatus
 * @param {string} nextStatus
 */
function validateStatusTransition(currentStatus, nextStatus) {
  const allowedTransitions = {
    pending: ['processing', 'confirmed', 'cancelled'],
    processing: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: [],
  }

  if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
    throw new OrderError(
      `Invalid status transition: ${currentStatus} → ${nextStatus}.`,
      'INVALID_STATUS_TRANSITION'
    )
  }
}

/**
 * Build a full order payload.
 *
 * @param {object} payload
 * @returns {object}
 */
function buildOrderPayload(payload) {
  const items = Array.isArray(payload?.items) ? payload.items.map(normalizeItem) : []

  if (!items.length) {
    throw new OrderError('An order must contain at least one item.', 'NO_ITEMS_IN_ORDER')
  }

  const subtotal = toMoney(items.reduce((sum, item) => sum + item.subtotal, 0))
  const discount = toMoney(payload?.discount)
  const shipping = toMoney(payload?.shipping)
  const taxableBase = Math.max(0, subtotal - discount)
  const tax = toMoney(payload?.tax ?? taxableBase * Number(payload?.taxRate || 0))
  const total = toMoney(taxableBase + tax + shipping)

  if (total <= 0) {
    throw new OrderError('Order total must be greater than zero.', 'INVALID_ORDER_TOTAL')
  }

  return {
    orderNumber: payload?.orderNumber || createOrderNumber(),
    clientId: payload?.clientId,
    userId: payload?.userId,
    status: payload?.status || 'pending',
    paymentStatus: payload?.paymentStatus || 'pending',
    paymentMethod: payload?.paymentMethod || null,
    paymentId: payload?.paymentId || null,
    currency: payload?.currency || 'USD',
    subtotal,
    discount,
    tax,
    shipping,
    total,
    items,
    shippingAddress: payload?.shippingAddress || null,
    billingAddress: payload?.billingAddress || null,
    notes: payload?.notes || null,
    customerNotes: payload?.customerNotes || null,
    internalNotes: payload?.internalNotes || null,
    metadata: payload?.metadata || {},
  }
}

/**
 * Normalize an order record for UI usage.
 *
 * @param {Record<string, any>|null} order
 * @returns {Record<string, any>|null}
 */
function normalizeOrder(order) {
  if (!order) return null

  return {
    ...order,
    id: order.id || order.orderId || null,
    createdAt: toDate(order.createdAt) || order.createdAt,
    updatedAt: toDate(order.updatedAt) || order.updatedAt,
    deliveredAt: toDate(order.deliveredAt) || order.deliveredAt,
    estimatedDelivery: toDate(order.estimatedDelivery) || order.estimatedDelivery,
  }
}

/**
 * Create order services using the root store and generated collection actions.
 *
 * @param {object} [options]
 * @param {ReturnType<typeof useAppStore>} [options.store]
 * @returns {object}
 */
export function createOrderServices({ store = useAppStore() } = {}) {
  const actions = resolveOrderActions(store)

  /**
   * @returns {Record<string, any>|null}
   */
  function getCurrentUser() {
    return store.currentUser?.value || store.currentUser || null
  }

  /**
   * @returns {Record<string, any>}
   */
  function requireUser() {
    const user = getCurrentUser()
    if (!user?.uid) {
      throw new OrderError('Authentication required.', 'AUTH_REQUIRED')
    }
    return user
  }

  /**
   * @param {object} [params]
   * @returns {Promise<any>}
   */
  async function list(params = {}) {
    if (typeof actions.fetchInitialPage === 'function') {
      return actions.fetchInitialPage(params)
    }

    if (typeof actions.list === 'function') {
      return actions.list(params)
    }

    throw new OrderError('Order listing is not supported.', 'LIST_NOT_SUPPORTED')
  }

  /**
   * @param {string} id
   * @returns {Promise<any>}
   */
  async function getById(id) {
    if (!id) {
      throw new OrderError('Order id is required.', 'ORDER_ID_REQUIRED')
    }

    if (typeof actions.getById !== 'function') {
      throw new OrderError('Order lookup is not supported.', 'GET_NOT_SUPPORTED')
    }

    const order = await actions.getById(id)
    return normalizeOrder(order)
  }

  /**
   * @param {string} orderNumber
   * @returns {Promise<any>}
   */
  async function getByNumber(orderNumber) {
    if (!orderNumber) {
      throw new OrderError('Order number is required.', 'ORDER_NUMBER_REQUIRED')
    }

    const sourceItems =
      store.orders?.items ||
      store.orders?.value?.items ||
      store.orders?.value ||
      store.orders ||
      []

    const match = Array.isArray(sourceItems)
      ? sourceItems.find((item) => item?.orderNumber === orderNumber)
      : null

    return normalizeOrder(match || null)
  }

  /**
   * @param {object} payload
   * @returns {Promise<any>}
   */
  async function create(payload) {
    const user = requireUser()
    const orderPayload = buildOrderPayload({
      ...payload,
      userId: payload?.userId || user.uid,
      clientId: payload?.clientId || user.clientId || user.uid,
    })

    if (typeof actions.create === 'function') {
      return actions.create(orderPayload)
    }

    if (typeof actions.add === 'function') {
      return actions.add(orderPayload)
    }

    throw new OrderError('Order creation is not supported.', 'CREATE_NOT_SUPPORTED')
  }

  /**
   * @param {object} cart
   * @param {object} [orderData]
   * @returns {Promise<any>}
   */
  async function createFromCart(cart, orderData = {}) {
    if (!cart || !Array.isArray(cart.items) || !cart.items.length) {
      throw new OrderError('Cannot create an order from an empty cart.', 'CART_EMPTY')
    }

    return create({
      items: cart.items,
      clientId: cart.clientId,
      shippingAddress: orderData.shippingAddress || cart.shippingAddress || null,
      billingAddress: orderData.billingAddress || cart.billingAddress || null,
      customerNotes: orderData.customerNotes || cart.customerNotes || null,
      notes: orderData.notes || null,
      discount: orderData.discount || cart.discount || 0,
      shipping: orderData.shipping || cart.shipping || 0,
      tax: orderData.tax,
      taxRate: orderData.taxRate,
      paymentMethod: orderData.paymentMethod || null,
      currency: orderData.currency || cart.currency || 'USD',
      metadata: {
        source: 'cart',
        ...(cart.metadata || {}),
        ...(orderData.metadata || {}),
      },
    })
  }

  /**
   * @param {string} id
   * @param {string} status
   * @param {object} [metadata]
   * @returns {Promise<any>}
   */
  async function updateStatus(id, status, metadata = {}) {
    const current = await getById(id)

    if (!current) {
      throw new OrderError('Order not found.', 'ORDER_NOT_FOUND')
    }

    validateStatusTransition(current.status, status)

    const payload = {
      status,
      updatedAt: new Date(),
    }

    if (status === 'processing') payload.processedAt = new Date()
    if (status === 'delivered') payload.deliveredAt = new Date()
    if (status === 'cancelled') payload.cancelledAt = new Date()

    if (status === 'shipped') {
      payload.trackingNumber = metadata.trackingNumber || current.trackingNumber || null
      payload.carrier = metadata.carrier || current.carrier || null
      payload.estimatedDelivery = metadata.estimatedDelivery || current.estimatedDelivery || null
    }

    if (typeof actions.update !== 'function') {
      throw new OrderError('Order updates are not supported.', 'UPDATE_NOT_SUPPORTED')
    }

    await actions.update(id, payload)
    return getById(id)
  }

  /**
   * @param {string} id
   * @param {object} payment
   * @returns {Promise<any>}
   */
  async function markPaid(id, payment = {}) {
    if (typeof actions.update !== 'function') {
      throw new OrderError('Payment updates are not supported.', 'UPDATE_NOT_SUPPORTED')
    }

    await actions.update(id, {
      paymentStatus: 'paid',
      paymentMethod: payment.method || 'manual',
      paymentId: payment.paymentId || null,
      updatedAt: new Date(),
    })

    return getById(id)
  }

  /**
   * @param {string} id
   * @param {object} [refund]
   * @returns {Promise<any>}
   */
  async function refund(id, refund = {}) {
    const order = await getById(id)

    if (!order) {
      throw new OrderError('Order not found.', 'ORDER_NOT_FOUND')
    }

    if (order.paymentStatus !== 'paid') {
      throw new OrderError('Only paid orders can be refunded.', 'ORDER_NOT_PAID')
    }

    if (typeof actions.update !== 'function') {
      throw new OrderError('Refund updates are not supported.', 'UPDATE_NOT_SUPPORTED')
    }

    const fullRefund = Number(refund.amount || order.total) >= Number(order.total)

    await actions.update(id, {
      paymentStatus: fullRefund ? 'refunded' : 'partial',
      status: fullRefund ? 'refunded' : order.status,
      metadata: {
        ...(order.metadata || {}),
        refund: {
          amount: refund.amount || order.total,
          reason: refund.reason || 'customer_request',
          processedAt: new Date(),
        },
      },
      updatedAt: new Date(),
      cancelledAt: fullRefund ? new Date() : order.cancelledAt || null,
    })

    return getById(id)
  }

  /**
   * @param {string} id
   * @returns {Promise<object>}
   */
  async function getInvoiceSummary(id) {
    const order = await getById(id)

    if (!order) {
      throw new OrderError('Order not found.', 'ORDER_NOT_FOUND')
    }

    return {
      ...order,
      issueDate: order.createdAt || new Date(),
      dueDate: order.createdAt || new Date(),
      lineItems: Array.isArray(order.items) ? order.items : [],
    }
  }

  return {
    list,
    getById,
    getByNumber,
    create,
    createFromCart,
    updateStatus,
    markPaid,
    refund,
    getInvoiceSummary,
  }
}

export default createOrderServices
