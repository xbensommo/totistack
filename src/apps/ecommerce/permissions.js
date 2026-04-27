/** @file src/apps/ecommerce/permissions.js */
export const ECOMMERCE_ROLES = Object.freeze({
  ADMIN: 'commerce.admin',
  MANAGER: 'commerce.manager',
  CATALOG_EDITOR: 'commerce.catalog_editor',
  ORDER_MANAGER: 'commerce.order_manager',
  INVENTORY_MANAGER: 'commerce.inventory_manager',
  VIEWER: 'commerce.viewer',
})

export const ECOMMERCE_PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'commerce.dashboard.view',
  PRODUCTS_READ: 'commerce.products.read',
  PRODUCTS_CREATE: 'commerce.products.create',
  PRODUCTS_UPDATE: 'commerce.products.update',
  PRODUCTS_PUBLISH: 'commerce.products.publish',
  PRODUCTS_DELETE: 'commerce.products.delete',
  CATEGORIES_MANAGE: 'commerce.categories.manage',
  CUSTOMERS_READ: 'commerce.customers.read',
  CUSTOMERS_UPDATE: 'commerce.customers.update',
  ORDERS_READ: 'commerce.orders.read',
  ORDERS_CREATE: 'commerce.orders.create',
  ORDERS_CANCEL: 'commerce.orders.cancel',
  ORDERS_FULFILL: 'commerce.orders.fulfill',
  ORDERS_DELIVER: 'commerce.orders.deliver',
  PAYMENTS_READ: 'commerce.payments.read',
  PAYMENTS_CONFIRM: 'commerce.payments.confirm',
  PAYMENTS_REJECT: 'commerce.payments.reject',
  INVENTORY_READ: 'commerce.inventory.read',
  INVENTORY_ADJUST: 'commerce.inventory.adjust',
  RETURNS_READ: 'commerce.returns.read',
  RETURNS_APPROVE: 'commerce.returns.approve',
  RETURNS_REJECT: 'commerce.returns.reject',
  SETTINGS_MANAGE: 'commerce.settings.manage',
})

export const ecommercePermissions = Object.freeze(Object.values(ECOMMERCE_PERMISSIONS))

export const ecommerceRolePermissions = Object.freeze({
  [ECOMMERCE_ROLES.ADMIN]: ecommercePermissions,
  [ECOMMERCE_ROLES.MANAGER]: ecommercePermissions.filter((permission) => permission !== ECOMMERCE_PERMISSIONS.PRODUCTS_DELETE),
  [ECOMMERCE_ROLES.CATALOG_EDITOR]: [
    ECOMMERCE_PERMISSIONS.DASHBOARD_VIEW,
    ECOMMERCE_PERMISSIONS.PRODUCTS_READ,
    ECOMMERCE_PERMISSIONS.PRODUCTS_CREATE,
    ECOMMERCE_PERMISSIONS.PRODUCTS_UPDATE,
    ECOMMERCE_PERMISSIONS.CATEGORIES_MANAGE,
    ECOMMERCE_PERMISSIONS.INVENTORY_READ,
  ],
  [ECOMMERCE_ROLES.ORDER_MANAGER]: [
    ECOMMERCE_PERMISSIONS.DASHBOARD_VIEW,
    ECOMMERCE_PERMISSIONS.CUSTOMERS_READ,
    ECOMMERCE_PERMISSIONS.ORDERS_READ,
    ECOMMERCE_PERMISSIONS.ORDERS_CREATE,
    ECOMMERCE_PERMISSIONS.ORDERS_CANCEL,
    ECOMMERCE_PERMISSIONS.ORDERS_FULFILL,
    ECOMMERCE_PERMISSIONS.ORDERS_DELIVER,
    ECOMMERCE_PERMISSIONS.PAYMENTS_READ,
    ECOMMERCE_PERMISSIONS.RETURNS_READ,
  ],
  [ECOMMERCE_ROLES.INVENTORY_MANAGER]: [
    ECOMMERCE_PERMISSIONS.DASHBOARD_VIEW,
    ECOMMERCE_PERMISSIONS.PRODUCTS_READ,
    ECOMMERCE_PERMISSIONS.INVENTORY_READ,
    ECOMMERCE_PERMISSIONS.INVENTORY_ADJUST,
  ],
  [ECOMMERCE_ROLES.VIEWER]: [
    ECOMMERCE_PERMISSIONS.DASHBOARD_VIEW,
    ECOMMERCE_PERMISSIONS.PRODUCTS_READ,
    ECOMMERCE_PERMISSIONS.CUSTOMERS_READ,
    ECOMMERCE_PERMISSIONS.ORDERS_READ,
    ECOMMERCE_PERMISSIONS.PAYMENTS_READ,
    ECOMMERCE_PERMISSIONS.INVENTORY_READ,
    ECOMMERCE_PERMISSIONS.RETURNS_READ,
  ],
})
