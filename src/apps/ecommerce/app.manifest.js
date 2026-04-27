/** @file src/apps/ecommerce/app.manifest.js */
import routes from './routes.js'
import ecommerceCollections from './collections/index.js'
import { ecommercePermissions } from './permissions.js'
import { createEcommerceActionDefinitions } from './ecommerce.actions.js'

export default {
  id: 'ecommerce',
  type: 'app',
  name: 'Ecommerce',
  version: '2.0.0',
  description: 'Production commerce operations app for products, orders, customers, inventory, returns, and payment proof workflows.',
  category: 'business',
  icon: 'shopping-bag',
  enabledByDefault: false,
  dependencies: ['auth', 'server-actions', 'notifications', 'audit'],
  routes,
  collections: ecommerceCollections,
  permissions: ecommercePermissions,
  createActionDefinitions: createEcommerceActionDefinitions,
  navigation: [
    { label: 'Commerce', to: '/app/ecommerce', icon: 'shopping-bag', permission: 'commerce.dashboard.view' },
    { label: 'Products', to: '/app/ecommerce/products', icon: 'package', permission: 'commerce.products.read' },
    { label: 'Orders', to: '/app/ecommerce/orders', icon: 'receipt-text', permission: 'commerce.orders.read' },
    { label: 'Customers', to: '/app/ecommerce/customers', icon: 'users', permission: 'commerce.customers.read' },
    { label: 'Inventory', to: '/app/ecommerce/inventory', icon: 'boxes', permission: 'commerce.inventory.read' },
    { label: 'Returns', to: '/app/ecommerce/returns', icon: 'undo-2', permission: 'commerce.returns.read' },
    { label: 'Settings', to: '/app/ecommerce/settings', icon: 'settings', permission: 'commerce.settings.manage' },
  ],
}
