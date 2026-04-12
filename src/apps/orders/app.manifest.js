/**
 * @file orders/app.manifest.js
 * @description Declarative Orders app manifest aligned with the latest Totistack assembly flow.
 *
 * This app remains intentionally declarative:
 * - no runtime route registration
 * - no provider creation
 * - no root auth/rbac ownership
 *
 * Totistack should discover this manifest and assemble the app through
 * generated registries under src/generated/*.
 */

export default {
  id: 'orders',
  type: 'app',
  name: 'Orders System',
  version: '3.0.0',
  description: 'Order operations for carts, checkout, invoicing, fulfillment, and customer history.',
  dependencies: {
    features: ['auth', 'rbac'],
    apps: ['client-records'],
  },
  navigation: {
    icon: 'ShoppingCart',
    label: 'Orders',
    priority: 30,
    roles: ['admin', 'manager', 'user'],
  },
  collections: ['orders'],
}
