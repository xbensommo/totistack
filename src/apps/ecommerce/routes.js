/** @file src/apps/ecommerce/routes.js */
import { ECOMMERCE_PERMISSIONS } from './permissions.js'

const view = (path, name, title, component, permission) => ({
  path,
  name,
  component,
  meta: { requiresAuth: true, app: 'ecommerce', title, permission },
})

export default [
  view('/app/ecommerce', 'EcommerceDashboard', 'Commerce', () => import('./pages/EcommerceDashboardPage.vue'), ECOMMERCE_PERMISSIONS.DASHBOARD_VIEW),
  view('/app/ecommerce/products', 'EcommerceProducts', 'Products', () => import('./pages/EcommerceProductsPage.vue'), ECOMMERCE_PERMISSIONS.PRODUCTS_READ),
  view('/app/ecommerce/orders', 'EcommerceOrders', 'Orders', () => import('./pages/EcommerceOrdersPage.vue'), ECOMMERCE_PERMISSIONS.ORDERS_READ),
  view('/app/ecommerce/customers', 'EcommerceCustomers', 'Customers', () => import('./pages/EcommerceCustomersPage.vue'), ECOMMERCE_PERMISSIONS.CUSTOMERS_READ),
  view('/app/ecommerce/inventory', 'EcommerceInventory', 'Inventory', () => import('./pages/EcommerceInventoryPage.vue'), ECOMMERCE_PERMISSIONS.INVENTORY_READ),
  view('/app/ecommerce/returns', 'EcommerceReturns', 'Returns', () => import('./pages/EcommerceReturnsPage.vue'), ECOMMERCE_PERMISSIONS.RETURNS_READ),
  view('/app/ecommerce/settings', 'EcommerceSettings', 'Store settings', () => import('./pages/EcommerceSettingsPage.vue'), ECOMMERCE_PERMISSIONS.SETTINGS_MANAGE),
]
