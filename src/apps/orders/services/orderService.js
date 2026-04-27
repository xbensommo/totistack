/**
 * @file orders/services/orderService.js
 * @description Profile-aware order service aligned with the latest Totistack root-store flow.
 */

import { useAppStore } from '@app/stores/appStore'
import getDefaultOrderBusinessProfile, { resolveOrderBusinessProfile } from '../business/default-profile.js'
import { ORDER_PERMISSIONS, canAccessOrder, hasOrderPermission } from '../permissions.js'

/**
 * Friendly base application error for order workflows.
 */
export class OrderError extends Error {
  /**
   * @param {string} message
   * @param {string} [code]
   * @param {unknown} [cause]
   * @param {number} [status]
   */
  constructor(message, code = 'ORDER_ERROR', cause = null, status = 400) {
    super(message)
    this.name = 'OrderError'
    this.code = code
    this.cause = cause
    this.status = status
  }
}

/**
 * Validation error for order input failures.
 */
export class OrderValidationError extends OrderError {
  /**
   * @param {string} message
   * @param {unknown} [cause]
   */
  constructor(message, cause = null) {
    super(message, 'ORDER_VALIDATION_ERROR', cause, 422)
    this.name = 'OrderValidationError'
  }
}

/**
 * Authorization error for forbidden order actions.
 */
export class OrderAuthorizationError extends OrderError {
  /**
   * @param {string} message
   * @param {unknown} [cause]
   */
  constructor(message, cause = null) {
    super(message, 'ORDER_FORBIDDEN', cause, 403)
    this.name = 'OrderAuthorizationError'
  }
}

/**
 * @param {Record<string, any>} store
 * @returns {Record<string, Function>}
 */
function resolveOrderActions(store) {
  const actions = store?.ordersActions || null

  if (!actions || typeof actions !== 'object') {
    throw new OrderError(
      'Missing root-store shard actions: store.ordersActions',
      'ORDER_ACTIONS_UNAVAILABLE',
      null,
      500,
    )
  }

  return actions
}

/**
 * @param {Record<string, any>} store
 * @returns {any[]}
 */
function resolveOrderState(store) {
  const state = store?.orders || []
  const items = state?.items || state?.value?.items || state?.value || state
  return Array.isArray(items) ? items : []
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
 * @param {string} currentStatus
 * @param {string} nextStatus
 */
function validateStatusTransition(currentStatus, nextStatus) {
  const allowedTransitions = {
    pending: ['processing', 'confirmed', 'cancelled', 'qualified', 'assigned'],
    processing: ['confirmed', 'cancelled', 'shipped'],
    confirmed: ['shipped', 'delivered', 'cancelled', 'approved'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    qualified: ['approved', 'cancelled'],
    approved: ['in_setup', 'delivered', 'cancelled'],
    in_setup: ['delivered', 'managed_care', 'cancelled'],
    managed_care: ['cancelled'],
    assigned: ['accepted', 'cancelled'],
    accepted: ['in_progress', 'cancelled'],
    in_progress: ['submitted', 'cancelled'],
    submitted: ['paid', 'closed', 'cancelled'],
    paid: ['closed', 'refunded'],
    closed: ['refunded'],
    cancelled: [],
    refunded: [],
  }

  if (currentStatus === nextStatus) {
    return
  }

  if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
    throw new OrderValidationError(`Invalid status transition: ${currentStatus} → ${nextStatus}.`)
  }
}

/**
 * @param {Record<string, any>|null|undefined} order
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
    completedAt: toDate(order.completedAt) || order.completedAt,
    processedAt: toDate(order.processedAt) || order.processedAt,
    cancelledAt: toDate(order.cancelledAt) || order.cancelledAt,
  }
}

/**
 * @param {object} payload
 * @param {Record<string, any>} context
 * @returns {object}
 */
function buildOrderPayload(payload, context) {
  const { user, profile } = context
  const items = Array.isArray(payload?.items) ? payload.items.map(normalizeItem) : []

  if (!items.length) {
    throw new OrderValidationError('An order must contain at least one item.')
  }

  const subtotal = toMoney(items.reduce((sum, item) => sum + item.subtotal, 0))
  const discount = toMoney(payload?.discount)
  const shipping = toMoney(payload?.shipping)
  const taxableBase = Math.max(0, subtotal - discount)
  const tax = toMoney(payload?.tax ?? taxableBase * Number(payload?.taxRate || 0))
  const total = toMoney(taxableBase + tax + shipping)

  if (total <= 0) {
    throw new OrderValidationError('Order total must be greater than zero.')
  }

  const clientId = payload?.clientId || payload?.customerId || user?.clientId || user?.uid || null
  const placedById = payload?.placedById || payload?.userId || user?.uid || null

  if (!clientId) {
    throw new OrderValidationError('Client or customer id is required.')
  }

  if (!placedById) {
    throw new OrderValidationError('Placed by id is required.')
  }

  return {
    orderNumber: payload?.orderNumber || createOrderNumber(),
    clientId,
    customerId: payload?.customerId || clientId,
    placedById,
    assignedTo: payload?.assignedTo || null,
    status: payload?.status || profile.defaults?.status || 'pending',
    businessStage: payload?.businessStage || payload?.status || profile.defaults?.status || 'pending',
    paymentStatus: payload?.paymentStatus || profile.defaults?.paymentStatus || 'pending',
    financeStatus: payload?.financeStatus || profile.defaults?.financeStatus || 'unposted',
    paymentMethod: payload?.paymentMethod || null,
    paymentId: payload?.paymentId || null,
    currency: payload?.currency || profile.defaults?.currency || 'USD',
    orderType: payload?.orderType || profile.defaults?.orderType || 'standard',
    fulfillmentType: payload?.fulfillmentType || profile.defaults?.fulfillmentType || 'internal',
    channel: payload?.channel || 'internal',
    sourceType: payload?.sourceType || 'manual',
    sourceId: payload?.sourceId || null,
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
    businessProfile: payload?.businessProfile || profile.code || 'generic',
    businessData: payload?.businessData || {},
    workflowData: payload?.workflowData || {},
    metadata: payload?.metadata || {},
  }
}

/**
 * @param {unknown} error
 * @returns {never}
 */
function normalizeAndThrow(error) {
  if (error instanceof OrderError) {
    throw error
  }

  throw new OrderError(
    error?.message || 'An unexpected order error occurred.',
    error?.code || 'ORDER_RUNTIME_ERROR',
    error,
    Number.isFinite(error?.status) ? error.status : 500,
  )
}

/**
 * Create order services using the root store and generated collection actions.
 *
 * @param {object} [options]
 * @param {ReturnType<typeof useAppStore>} [options.store]
 * @param {string} [options.profileName]
 * @returns {object}
 */
export function createOrderServices({ store = useAppStore(), profileName } = {}) {
  const actions = resolveOrderActions(store)
  const profile = getDefaultOrderBusinessProfile({
    profileName:
      profileName ||
      store?.projectConfig?.businessProfile ||
      store?.businessProfile ||
      'generic',
  })

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
      throw new OrderAuthorizationError('Authentication required.')
    }
    return user
  }

  /**
   * @param {string} permission
   * @param {Record<string, any>|null} [order]
   * @returns {Record<string, any>}
   */
  function authorize(permission, order = null) {
    const user = requireUser()
    if (!canAccessOrder(user, permission, order)) {
      throw new OrderAuthorizationError('You are not allowed to perform this order action.')
    }
    return user
  }

  /**
   * @param {string} id
   * @returns {Promise<Record<string, any>|null>}
   */
  async function getById(id) {
    try {
      if (!id) {
        throw new OrderValidationError('Order id is required.')
      }

      if (typeof actions.getById !== 'function') {
        throw new OrderError('Order lookup is not supported.', 'GET_NOT_SUPPORTED', null, 501)
      }

      const order = normalizeOrder(await actions.getById(id))

      if (!order) {
        return null
      }

      authorize(ORDER_PERMISSIONS.VIEW, order)
      return order
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {object} [params]
   * @returns {Promise<any>}
   */
  async function list(params = {}) {
    try {
      authorize(ORDER_PERMISSIONS.VIEW)

      if (typeof actions.fetchInitialPage !== 'function') {
        throw new OrderError('Missing shard action method: ordersActions.fetchInitialPage', 'LIST_NOT_SUPPORTED', null, 501)
      }

      return await actions.fetchInitialPage(params)
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {string} orderNumber
   * @returns {Promise<Record<string, any>|null>}
   */
  async function getByNumber(orderNumber) {
    try {
      if (!orderNumber) {
        throw new OrderValidationError('Order number is required.')
      }

      authorize(ORDER_PERMISSIONS.VIEW)

      const match = resolveOrderState(store).find((item) => item?.orderNumber === orderNumber)
      const order = normalizeOrder(match || null)

      if (order) {
        authorize(ORDER_PERMISSIONS.VIEW, order)
      }

      return order
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {object} payload
   * @returns {Promise<any>}
   */
  async function create(payload) {
    try {
      const user = authorize(ORDER_PERMISSIONS.CREATE)
      const orderPayload = buildOrderPayload(payload, { user, profile })

      if (typeof actions.create === 'function') {
        return await actions.create(orderPayload)
      }

      if (typeof actions.add === 'function') {
        return await actions.add(orderPayload)
      }

      throw new OrderError('Order creation is not supported.', 'CREATE_NOT_SUPPORTED', null, 501)
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {object} cart
   * @param {object} [orderData]
   * @returns {Promise<any>}
   */
  async function createFromCart(cart, orderData = {}) {
    try {
      if (!cart || !Array.isArray(cart.items) || !cart.items.length) {
        throw new OrderValidationError('Cannot create an order from an empty cart.')
      }

      return await create({
        items: cart.items,
        clientId: cart.clientId,
        customerId: cart.customerId,
        shippingAddress: orderData.shippingAddress || cart.shippingAddress || null,
        billingAddress: orderData.billingAddress || cart.billingAddress || null,
        customerNotes: orderData.customerNotes || cart.customerNotes || null,
        notes: orderData.notes || null,
        discount: orderData.discount || cart.discount || 0,
        shipping: orderData.shipping || cart.shipping || 0,
        tax: orderData.tax,
        taxRate: orderData.taxRate,
        paymentMethod: orderData.paymentMethod || null,
        currency: orderData.currency || cart.currency || profile.defaults?.currency || 'USD',
        channel: orderData.channel || 'cart',
        sourceType: orderData.sourceType || 'cart',
        sourceId: orderData.sourceId || cart.id || null,
        metadata: {
          source: 'cart',
          ...(cart.metadata || {}),
          ...(orderData.metadata || {}),
        },
        businessData: {
          ...(cart.businessData || {}),
          ...(orderData.businessData || {}),
        },
      })
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {string} id
   * @param {Record<string, any>} payload
   * @returns {Promise<any>}
   */
  async function patch(id, payload) {
    try {
      const current = await getById(id)

      if (!current) {
        throw new OrderError('Order not found.', 'ORDER_NOT_FOUND', null, 404)
      }

      authorize(ORDER_PERMISSIONS.UPDATE, current)

      if (typeof actions.update !== 'function') {
        throw new OrderError('Order updates are not supported.', 'UPDATE_NOT_SUPPORTED', null, 501)
      }

      await actions.update(id, {
        ...payload,
        updatedAt: new Date(),
      })

      return await getById(id)
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {string} id
   * @param {string} status
   * @param {object} [metadata]
   * @returns {Promise<any>}
   */
  async function updateStatus(id, status, metadata = {}) {
    try {
      const current = await getById(id)

      if (!current) {
        throw new OrderError('Order not found.', 'ORDER_NOT_FOUND', null, 404)
      }

      authorize(ORDER_PERMISSIONS.UPDATE_STATUS, current)
      validateStatusTransition(current.status, status)

      const payload = {
        status,
        businessStage: metadata.businessStage || status,
      }

      if (status === 'processing') payload.processedAt = new Date()
      if (status === 'delivered' || status === 'closed') payload.deliveredAt = new Date()
      if (status === 'cancelled') payload.cancelledAt = new Date()
      if (status === 'shipped') {
        payload.trackingNumber = metadata.trackingNumber || current.trackingNumber || null
        payload.carrier = metadata.carrier || current.carrier || null
        payload.estimatedDelivery = metadata.estimatedDelivery || current.estimatedDelivery || null
      }

      if (status === 'paid') {
        payload.paymentStatus = 'paid'
      }

      return await patch(id, payload)
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {string} id
   * @param {object} payment
   * @returns {Promise<any>}
   */
  async function markPaid(id, payment = {}) {
    try {
      const current = await getById(id)

      if (!current) {
        throw new OrderError('Order not found.', 'ORDER_NOT_FOUND', null, 404)
      }

      authorize(ORDER_PERMISSIONS.MARK_PAID, current)

      return await patch(id, {
        paymentStatus: 'paid',
        financeStatus: payment.financeStatus || 'posted',
        paymentMethod: payment.method || current.paymentMethod || 'manual',
        paymentId: payment.paymentId || null,
        metadata: {
          ...(current.metadata || {}),
          lastPayment: {
            amount: payment.amount || current.total || 0,
            receivedAt: payment.receivedAt || new Date(),
            reference: payment.reference || null,
          },
        },
      })
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {string} id
   * @param {object} assignment
   * @returns {Promise<any>}
   */
  async function assignOrder(id, assignment = {}) {
    try {
      const current = await getById(id)

      if (!current) {
        throw new OrderError('Order not found.', 'ORDER_NOT_FOUND', null, 404)
      }

      authorize(ORDER_PERMISSIONS.ASSIGN, current)

      if (!assignment.assignedTo) {
        throw new OrderValidationError('Assigned user id is required.')
      }

      return await patch(id, {
        assignedTo: assignment.assignedTo,
        workflowData: {
          ...(current.workflowData || {}),
          assignment: {
            assignedAt: new Date(),
            assignedBy: requireUser().uid,
            note: assignment.note || null,
          },
        },
      })
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {string} id
   * @returns {Promise<any>}
   */
  async function cancelOrder(id) {
    return updateStatus(id, 'cancelled')
  }

  /**
   * @param {string} id
   * @param {object} [payload]
   * @returns {Promise<any>}
   */
  async function shipOrder(id, payload = {}) {
    return updateStatus(id, 'shipped', payload)
  }

  /**
   * @param {string} id
   * @returns {Promise<any>}
   */
  async function deliverOrder(id) {
    return updateStatus(id, profile.code === 'eduprolic' ? 'closed' : 'delivered')
  }

  /**
   * @param {string} id
   * @param {object} [refund]
   * @returns {Promise<any>}
   */
  async function refund(id, refund = {}) {
    try {
      const order = await getById(id)

      if (!order) {
        throw new OrderError('Order not found.', 'ORDER_NOT_FOUND', null, 404)
      }

      authorize(ORDER_PERMISSIONS.REFUND, order)

      if (order.paymentStatus !== 'paid') {
        throw new OrderValidationError('Only paid orders can be refunded.')
      }

      const fullRefund = Number(refund.amount || order.total) >= Number(order.total)

      return await patch(id, {
        paymentStatus: fullRefund ? 'refunded' : 'partial',
        status: fullRefund ? 'refunded' : order.status,
        financeStatus: 'reversed',
        metadata: {
          ...(order.metadata || {}),
          refund: {
            amount: refund.amount || order.total,
            reason: refund.reason || 'customer_request',
            processedAt: new Date(),
          },
        },
        cancelledAt: fullRefund ? new Date() : order.cancelledAt || null,
      })
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {string} id
   * @returns {Promise<object>}
   */
  async function getInvoiceSummary(id) {
    try {
      const order = await getById(id)

      if (!order) {
        throw new OrderError('Order not found.', 'ORDER_NOT_FOUND', null, 404)
      }

      authorize(ORDER_PERMISSIONS.VIEW_INVOICE, order)

      return {
        ...order,
        issueDate: order.createdAt || new Date(),
        dueDate: order.createdAt || new Date(),
        lineItems: Array.isArray(order.items) ? order.items : [],
      }
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  /**
   * @param {string} actionKey
   * @param {object} [context]
   * @returns {Promise<any>}
   */
  async function runBusinessAction(actionKey, context = {}) {
    try {
      const action = profile.availableActions?.[actionKey]

      if (!action) {
        throw new OrderValidationError(`Unknown business action: ${actionKey}.`)
      }

      if (action.permission && !hasOrderPermission(requireUser(), action.permission)) {
        throw new OrderAuthorizationError('You are not allowed to run this business action.')
      }

      switch (action.handler) {
        case 'create':
          return await create(context.payload || {})
        case 'assignOrder':
          return await assignOrder(context.id, context.payload || {})
        case 'markPaid':
          return await markPaid(context.id, context.payload || {})
        case 'cancelOrder':
          return await cancelOrder(context.id)
        case 'shipOrder':
          return await shipOrder(context.id, context.payload || {})
        case 'deliverOrder':
          return await deliverOrder(context.id)
        case 'refund':
          return await refund(context.id, context.payload || {})
        default:
          throw new OrderValidationError(`Unsupported action handler: ${action.handler}.`)
      }
    } catch (error) {
      normalizeAndThrow(error)
    }
  }

  return {
    profile,
    resolveProfile: resolveOrderBusinessProfile,
    list,
    getById,
    getByNumber,
    create,
    createFromCart,
    patch,
    updateStatus,
    assignOrder,
    markPaid,
    refund,
    cancelOrder,
    shipOrder,
    deliverOrder,
    getInvoiceSummary,
    runBusinessAction,
  }
}

export default createOrderServices
