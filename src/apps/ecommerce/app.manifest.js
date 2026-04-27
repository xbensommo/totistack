/**
 * @file src/apps/ecommerce/app.manifest.js
 * @description Totistack ecommerce app manifest.
 */

import routes from './routes/index.js'
import { ecommerceCollections } from './definitions/ecommerce.definitions.js'
import { ecommercePermissions } from './definitions/ecommerce.permissions.js'
import { createEcommerceServices } from './services/index.js'

export default {
  id: 'ecommerce',
  name: 'Ecommerce',
  version: '1.2.0',
  description: 'Commerce app for Totistack with catalog, orders, Namibia-first payments, returns, notifications, and storefront operations.',
  category: 'business',
  icon: 'shopping-bag',
  enabledByDefault: false,
  dependencies: ['auth', 'rbac', 'notifications', 'seo'],
  routes,
  permissions: ecommercePermissions,
  collections: ecommerceCollections,
  createServices: createEcommerceServices,
  navigation: [
    { label: 'Commerce', to: '/app/ecommerce', icon: 'shopping-bag', permission: 'ecommerce.dashboard.view' },
    { label: 'Products', to: '/app/ecommerce/products', icon: 'package', permission: 'catalog.read' },
    { label: 'Orders', to: '/app/ecommerce/orders', icon: 'receipt-text', permission: 'orders.read' },
    { label: 'Customers', to: '/app/ecommerce/customers', icon: 'users', permission: 'customers.read' },
    { label: 'Discounts', to: '/app/ecommerce/discounts', icon: 'badge-percent', permission: 'promotions.manage' },
    { label: 'Payments', to: '/app/ecommerce/payments', icon: 'credit-card', permission: 'payments.read' },
    { label: 'Returns', to: '/app/ecommerce/returns', icon: 'undo-2', permission: 'returns.manage' },
    { label: 'Notifications', to: '/app/ecommerce/notifications', icon: 'bell', permission: 'notifications.read' },
    { label: 'Storefront', to: '/app/ecommerce/storefront', icon: 'monitor-smartphone', permission: 'storefront.manage' },
  ],
}
