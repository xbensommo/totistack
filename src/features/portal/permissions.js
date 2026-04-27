/** @file src/features/portal/permissions.js */

export const PORTAL_PERMISSIONS = Object.freeze({
  VIEW_SELF: 'portal.self.view',
  MANAGE_SELF: 'portal.self.manage',
  SUPPORT_CREATE: 'portal.support.create',
  DOCUMENTS_VIEW: 'portal.documents.view',
  BILLING_VIEW: 'portal.billing.view',
  ORDERS_VIEW: 'portal.orders.view',
  MEMBERSHIPS_VIEW: 'portal.memberships.view',
  MEMBERSHIPS_MANAGE: 'portal.memberships.manage',
  INVITES_MANAGE: 'portal.invites.manage',
  ADMIN_VIEW: 'portal.admin.view',
  ADMIN_MANAGE: 'portal.admin.manage',
})

export const PORTAL_ROLE_TEMPLATES = Object.freeze({
  admin: [PORTAL_PERMISSIONS.ADMIN_MANAGE],
  sysadmin: [PORTAL_PERMISSIONS.ADMIN_MANAGE],
  receptionist: [
    PORTAL_PERMISSIONS.ADMIN_VIEW,
    PORTAL_PERMISSIONS.VIEW_SELF,
    PORTAL_PERMISSIONS.MEMBERSHIPS_VIEW,
    PORTAL_PERMISSIONS.MEMBERSHIPS_MANAGE,
    PORTAL_PERMISSIONS.INVITES_MANAGE,
    PORTAL_PERMISSIONS.SUPPORT_CREATE,
  ],
  consultant: [
    PORTAL_PERMISSIONS.ADMIN_VIEW,
    PORTAL_PERMISSIONS.MEMBERSHIPS_VIEW,
    PORTAL_PERMISSIONS.DOCUMENTS_VIEW,
    PORTAL_PERMISSIONS.BILLING_VIEW,
  ],
  customer: [
    PORTAL_PERMISSIONS.VIEW_SELF,
    PORTAL_PERMISSIONS.MANAGE_SELF,
    PORTAL_PERMISSIONS.SUPPORT_CREATE,
    PORTAL_PERMISSIONS.DOCUMENTS_VIEW,
    PORTAL_PERMISSIONS.BILLING_VIEW,
    PORTAL_PERMISSIONS.ORDERS_VIEW,
  ],
  student: [
    PORTAL_PERMISSIONS.VIEW_SELF,
    PORTAL_PERMISSIONS.MANAGE_SELF,
    PORTAL_PERMISSIONS.SUPPORT_CREATE,
    PORTAL_PERMISSIONS.DOCUMENTS_VIEW,
    PORTAL_PERMISSIONS.BILLING_VIEW,
  ],
  guardian: [
    PORTAL_PERMISSIONS.VIEW_SELF,
    PORTAL_PERMISSIONS.MANAGE_SELF,
    PORTAL_PERMISSIONS.SUPPORT_CREATE,
    PORTAL_PERMISSIONS.DOCUMENTS_VIEW,
    PORTAL_PERMISSIONS.BILLING_VIEW,
  ],
  client: [
    PORTAL_PERMISSIONS.VIEW_SELF,
    PORTAL_PERMISSIONS.MANAGE_SELF,
    PORTAL_PERMISSIONS.SUPPORT_CREATE,
    PORTAL_PERMISSIONS.DOCUMENTS_VIEW,
    PORTAL_PERMISSIONS.BILLING_VIEW,
    PORTAL_PERMISSIONS.ORDERS_VIEW,
  ],
})

/**
 * Check whether an actor has a portal permission.
 *
 * @param {object|null} actor
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPortalPermission(actor, permission) {
  if (!permission) return true

  const roles = Array.isArray(actor?.roles) ? actor.roles : []
  const directPermissions = Array.isArray(actor?.permissions) ? actor.permissions : []
  const templatePermissions = roles.flatMap((role) => PORTAL_ROLE_TEMPLATES[role] || [])

  return (
    directPermissions.includes(permission) ||
    templatePermissions.includes(permission) ||
    roles.includes('admin') ||
    roles.includes('sysadmin')
  )
}

/**
 * Determine whether an actor can see or act on a membership-scoped record.
 *
 * @param {object|null} actor
 * @param {object|null} membership
 * @returns {boolean}
 */
export function canAccessMembership(actor, membership) {
  if (!actor || !membership) return false
  if (hasPortalPermission(actor, PORTAL_PERMISSIONS.ADMIN_VIEW)) return true

  const actorId = actor.uid || actor.id || null
  if (!actorId) return false

  return [
    membership?.portalAccountId,
    membership?.externalUserId,
    membership?.userId,
    membership?.linkedUserId,
  ].includes(actorId)
}

export default PORTAL_PERMISSIONS
