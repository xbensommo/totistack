/**
 * @file src/apps/ecommerce/routes/index.js
 * @description Ecommerce route contributions.
 */

const routes = [
  {
    path: '/app/ecommerce',
    name: 'ecommerce.dashboard',
    component: () => import('../pages/EcommerceDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      app: 'ecommerce',
      permission: 'ecommerce.dashboard.view',
      navLabel: 'Commerce',
    },
  },
  {
    path: '/app/ecommerce/products',
    name: 'ecommerce.products',
    component: () => import('../pages/EcommerceProductsPage.vue'),
    meta: {
      requiresAuth: true,
      app: 'ecommerce',
      permission: 'catalog.read',
      navLabel: 'Products',
    },
  },
  {
    path: '/app/ecommerce/orders',
    name: 'ecommerce.orders',
    component: () => import('../pages/EcommerceOrdersPage.vue'),
    meta: {
      requiresAuth: true,
      app: 'ecommerce',
      permission: 'orders.read',
      navLabel: 'Orders',
    },
  },
  {
    path: '/app/ecommerce/customers',
    name: 'ecommerce.customers',
    component: () => import('../pages/EcommerceCustomersPage.vue'),
    meta: {
      requiresAuth: true,
      app: 'ecommerce',
      permission: 'customers.read',
      navLabel: 'Customers',
    },
  },
  {
    path: '/app/ecommerce/discounts',
    name: 'ecommerce.discounts',
    component: () => import('../pages/EcommerceDiscountsPage.vue'),
    meta: {
      requiresAuth: true,
      app: 'ecommerce',
      permission: 'promotions.manage',
      navLabel: 'Discounts',
    },
  },
  {
    path: '/app/ecommerce/payments',
    name: 'ecommerce.payments',
    component: () => import('../pages/EcommercePaymentsPage.vue'),
    meta: {
      requiresAuth: true,
      app: 'ecommerce',
      permission: 'payments.read',
      navLabel: 'Payments',
    },
  },
  {
    path: '/app/ecommerce/returns',
    name: 'ecommerce.returns',
    component: () => import('../pages/EcommerceReturnsPage.vue'),
    meta: {
      requiresAuth: true,
      app: 'ecommerce',
      permission: 'returns.manage',
      navLabel: 'Returns',
    },
  },
  {
    path: '/app/ecommerce/notifications',
    name: 'ecommerce.notifications',
    component: () => import('../pages/EcommerceNotificationsPage.vue'),
    meta: {
      requiresAuth: true,
      app: 'ecommerce',
      permission: 'notifications.read',
      navLabel: 'Notifications',
    },
  },
  {
    path: '/app/ecommerce/storefront',
    name: 'ecommerce.storefront.manage',
    component: () => import('../pages/EcommerceStorefrontPage.vue'),
    meta: {
      requiresAuth: true,
      app: 'ecommerce',
      permission: 'storefront.manage',
      navLabel: 'Storefront',
    },
  },
  {
    path: '/shop',
    name: 'ecommerce.storefront.public',
    component: () => import('../pages/EcommerceStorefrontPage.vue'),
    meta: {
      requiresAuth: false,
      app: 'ecommerce',
      navLabel: 'Storefront',
      isPublicStorefront: true,
    },
  },
]

export default routes
