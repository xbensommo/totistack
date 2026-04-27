/**
 * @file src/apps/ecommerce/definitions/ecommerce.permissions.js
 * @description RBAC permissions for ecommerce app.
 */

export const ecommerceRoles = [
  'super_admin',
  'ecommerce_admin',
  'store_manager',
  'catalog_manager',
  'inventory_manager',
  'order_manager',
  'support_agent',
  'finance_manager',
  'marketing_manager',
  'content_editor',
  'warehouse_staff',
  'branch_staff',
  'customer',
]

export const ecommercePermissions = {
  roles: ecommerceRoles,
  permissions: {
    'ecommerce.dashboard.view': ['super_admin', 'ecommerce_admin', 'store_manager', 'finance_manager'],
    'catalog.read': ['super_admin', 'ecommerce_admin', 'store_manager', 'catalog_manager', 'marketing_manager', 'content_editor'],
    'catalog.write': ['super_admin', 'ecommerce_admin', 'store_manager', 'catalog_manager'],
    'catalog.publish': ['super_admin', 'ecommerce_admin', 'store_manager', 'catalog_manager'],
    'pricing.manage': ['super_admin', 'ecommerce_admin', 'store_manager', 'finance_manager', 'marketing_manager'],
    'inventory.read': ['super_admin', 'ecommerce_admin', 'store_manager', 'inventory_manager', 'warehouse_staff', 'branch_staff'],
    'inventory.adjust': ['super_admin', 'ecommerce_admin', 'store_manager', 'inventory_manager', 'warehouse_staff'],
    'orders.read': ['super_admin', 'ecommerce_admin', 'store_manager', 'order_manager', 'support_agent', 'finance_manager', 'warehouse_staff'],
    'orders.manage': ['super_admin', 'ecommerce_admin', 'store_manager', 'order_manager'],
    'orders.fulfill': ['super_admin', 'ecommerce_admin', 'store_manager', 'order_manager', 'warehouse_staff'],
    'payments.read': ['super_admin', 'ecommerce_admin', 'store_manager', 'finance_manager', 'order_manager'],
    'payments.manage': ['super_admin', 'ecommerce_admin', 'store_manager', 'finance_manager'],
    'returns.manage': ['super_admin', 'ecommerce_admin', 'store_manager', 'order_manager', 'support_agent'],
    'refunds.approve': ['super_admin', 'ecommerce_admin', 'finance_manager'],
    'customers.read': ['super_admin', 'ecommerce_admin', 'store_manager', 'support_agent', 'marketing_manager'],
    'customers.manage': ['super_admin', 'ecommerce_admin', 'store_manager', 'support_agent'],
    'promotions.manage': ['super_admin', 'ecommerce_admin', 'store_manager', 'marketing_manager'],
    'notifications.read': ['super_admin', 'ecommerce_admin', 'store_manager', 'order_manager', 'support_agent', 'finance_manager', 'catalog_manager'],
    'notifications.manage': ['super_admin', 'ecommerce_admin', 'store_manager'],
    'reviews.moderate': ['super_admin', 'ecommerce_admin', 'store_manager', 'marketing_manager'],
    'storefront.manage': ['super_admin', 'ecommerce_admin', 'store_manager', 'content_editor', 'marketing_manager'],
    'analytics.view': ['super_admin', 'ecommerce_admin', 'store_manager', 'marketing_manager', 'finance_manager'],
    'settings.manage': ['super_admin', 'ecommerce_admin', 'store_manager'],
  },
}

/**
 * Check whether a role is granted a permission.
 *
 * @param {string} permission
 * @param {string | string[]} roleOrRoles
 * @returns {boolean}
 */
export function hasEcommercePermission(permission, roleOrRoles) {
  const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles]
  const allowedRoles = ecommercePermissions.permissions[permission] || []
  return roles.some((role) => allowedRoles.includes(role))
}

export default ecommercePermissions
