/**
 * @file orders/routes.js
 * @description Declarative route records for the Orders app.
 */

const routes = [
  {
    path: '/orders',
    name: 'OrdersList',
    component: () => import('./pages/OrdersListPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'orders',
      roles: ['admin', 'manager', 'user'],
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
      roles: ['admin', 'manager', 'user'],
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
      roles: ['admin', 'manager', 'user'],
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
      roles: ['admin', 'manager', 'user'],
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
      roles: ['admin', 'manager', 'user'],
      title: 'Invoice',
    },
  },
]

export default routes
