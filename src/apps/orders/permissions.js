/**
 * @file orders/permissions.js
 * @description Central permission model for the Orders app.
 */

export const ORDER_PERMISSIONS = Object.freeze({
  VIEW: 'orders.view',
  VIEW_OWN: 'orders.view_own',
  CREATE: 'orders.create',
  UPDATE: 'orders.update',
  UPDATE_STATUS: 'orders.update_status',
  ASSIGN: 'orders.assign',
  MARK_PAID: 'orders.mark_paid',
  REFUND: 'orders.refund',
  VIEW_INVOICE: 'orders.view_invoice',
  CANCEL: 'orders.cancel',
  SHIP: 'orders.ship',
  DELIVER: 'orders.deliver',
})

export const ORDER_ROLE_PERMISSIONS = Object.freeze({
  sysadmin: ['*'],
  admin: ['*'],
  manager: [
    ORDER_PERMISSIONS.VIEW,
    ORDER_PERMISSIONS.CREATE,
    ORDER_PERMISSIONS.UPDATE,
    ORDER_PERMISSIONS.UPDATE_STATUS,
    ORDER_PERMISSIONS.ASSIGN,
    ORDER_PERMISSIONS.MARK_PAID,
    ORDER_PERMISSIONS.REFUND,
    ORDER_PERMISSIONS.VIEW_INVOICE,
    ORDER_PERMISSIONS.CANCEL,
    ORDER_PERMISSIONS.SHIP,
    ORDER_PERMISSIONS.DELIVER,
  ],
  receptionist: [
    ORDER_PERMISSIONS.VIEW,
    ORDER_PERMISSIONS.CREATE,
    ORDER_PERMISSIONS.UPDATE,
    ORDER_PERMISSIONS.UPDATE_STATUS,
    ORDER_PERMISSIONS.VIEW_INVOICE,
  ],
  consultant: [
    ORDER_PERMISSIONS.VIEW_OWN,
    ORDER_PERMISSIONS.VIEW_INVOICE,
  ],
  user: [
    ORDER_PERMISSIONS.VIEW_OWN,
    ORDER_PERMISSIONS.CREATE,
    ORDER_PERMISSIONS.VIEW_INVOICE,
  ],
})

/**
 * @param {Record<string, any>|null|undefined} user
 * @returns {string[]}
 */
export function getUserRoles(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const role = typeof user?.role === 'string' && user.role ? [user.role] : []

  return [...new Set([...roles, ...role].filter(Boolean).map((value) => String(value).trim()))]
}

/**
 * @param {Record<string, any>|null|undefined} user
 * @returns {string[]}
 */
export function getUserPermissions(user) {
  const explicitPermissions = Array.isArray(user?.permissions)
    ? user.permissions.filter(Boolean).map(String)
    : []

  const rolePermissions = getUserRoles(user).flatMap((role) => ORDER_ROLE_PERMISSIONS[role] || [])

  return [...new Set([...explicitPermissions, ...rolePermissions])]
}

/**
 * @param {Record<string, any>|null|undefined} user
 * @returns {boolean}
 */
export function isPrivilegedOrderUser(user) {
  return getUserRoles(user).some((role) => ['sysadmin', 'admin', 'manager'].includes(role))
}

/**
 * @param {Record<string, any>|null|undefined} user
 * @param {string} permission
 * @returns {boolean}
 */
export function hasOrderPermission(user, permission) {
  const permissions = getUserPermissions(user)
  return permissions.includes('*') || permissions.includes(permission)
}

/**
 * @param {Record<string, any>|null|undefined} user
 * @param {Record<string, any>|null|undefined} order
 * @returns {boolean}
 */
export function isOrderOwner(user, order) {
  if (!user?.uid || !order) return false

  const comparableIds = [
    order.placedById,
    order.customerId,
    order.clientId,
    order.createdBy,
    order.userId,
  ]
    .filter(Boolean)
    .map(String)

  return comparableIds.includes(String(user.uid))
}

/**
 * @param {Record<string, any>|null|undefined} user
 * @param {string} permission
 * @param {Record<string, any>|null|undefined} [order]
 * @returns {boolean}
 */
export function canAccessOrder(user, permission, order = null) {
  if (hasOrderPermission(user, permission)) {
    return true
  }

  if (permission === ORDER_PERMISSIONS.VIEW && hasOrderPermission(user, ORDER_PERMISSIONS.VIEW_OWN)) {
    return isOrderOwner(user, order)
  }

  if (permission === ORDER_PERMISSIONS.VIEW_INVOICE && hasOrderPermission(user, ORDER_PERMISSIONS.VIEW_OWN)) {
    return isOrderOwner(user, order)
  }

  return false
}

export default {
  ORDER_PERMISSIONS,
  ORDER_ROLE_PERMISSIONS,
  getUserRoles,
  getUserPermissions,
  hasOrderPermission,
  isOrderOwner,
  canAccessOrder,
  isPrivilegedOrderUser,
}
