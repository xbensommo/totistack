/**
 * @file orders/business/profiles/generic.js
 * @description Default business profile for the Orders app.
 */

import { ORDER_PERMISSIONS } from '../../permissions.js'

export default Object.freeze({
  code: 'generic',
  name: 'Generic Orders',
  description: 'Balanced profile for retail, service, and back-office order capture.',
  labels: {
    singular: 'Order',
    plural: 'Orders',
    customer: 'Customer',
    assignee: 'Assignee',
  },
  defaults: {
    currency: 'USD',
    status: 'pending',
    paymentStatus: 'pending',
    orderType: 'standard',
    fulfillmentType: 'internal',
    financeStatus: 'unposted',
  },
  stages: [
    'pending',
    'processing',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ],
  paymentStatuses: ['pending', 'paid', 'partial', 'refunded', 'failed'],
  availableActions: {
    createOrder: {
      permission: ORDER_PERMISSIONS.CREATE,
      handler: 'create',
      confirm: false,
    },
    assignOrder: {
      permission: ORDER_PERMISSIONS.ASSIGN,
      handler: 'assignOrder',
      confirm: true,
    },
    markPaid: {
      permission: ORDER_PERMISSIONS.MARK_PAID,
      handler: 'markPaid',
      confirm: true,
    },
    cancelOrder: {
      permission: ORDER_PERMISSIONS.CANCEL,
      handler: 'cancelOrder',
      confirm: true,
    },
    shipOrder: {
      permission: ORDER_PERMISSIONS.SHIP,
      handler: 'shipOrder',
      confirm: true,
    },
    deliverOrder: {
      permission: ORDER_PERMISSIONS.DELIVER,
      handler: 'deliverOrder',
      confirm: true,
    },
    refundOrder: {
      permission: ORDER_PERMISSIONS.REFUND,
      handler: 'refund',
      confirm: true,
    },
  },
})
