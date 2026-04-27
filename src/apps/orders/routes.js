/**
 * @file orders/routes.js
 * @description Declarative route records for the Orders app.
 */

import { ORDER_PERMISSIONS } from './permissions.js'

const routes = [
  {
    path: '/orders',
    name: 'OrdersList',
    component: () => import('./pages/OrdersListPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'orders',
      permission: ORDER_PERMISSIONS.VIEW,
      roles: ['admin', 'manager', 'receptionist', 'consultant', 'user'],
      title: 'Orders',
    },
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('./pages/OrderDetailPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'orders',
      permission: ORDER_PERMISSIONS.VIEW,
      roles: ['admin', 'manager', 'receptionist', 'consultant', 'user'],
      title: 'Order Details',
    },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('./pages/CartPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'orders',
      permission: ORDER_PERMISSIONS.CREATE,
      roles: ['admin', 'manager', 'receptionist', 'user'],
      title: 'Cart',
    },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('./pages/CheckoutPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'orders',
      permission: ORDER_PERMISSIONS.CREATE,
      roles: ['admin', 'manager', 'receptionist', 'user'],
      title: 'Checkout',
    },
  },
  {
    path: '/orders/:id/invoice',
    name: 'OrderInvoice',
    component: () => import('./pages/InvoicePage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'orders',
      permission: ORDER_PERMISSIONS.VIEW_INVOICE,
      roles: ['admin', 'manager', 'receptionist', 'consultant', 'user'],
      title: 'Invoice',
    },
  },
]

export default routes
