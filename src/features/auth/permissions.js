/**
 * @file src/features/auth/permissions.js
 * @description SOC 2 oriented RBAC/permission catalog for Totistack auth.
 *
 * Design rules:
 * - Roles are permission bundles only. Runtime authorization checks permissions.
 * - `sysadmin` is the only built-in break-glass role and should be tightly controlled.
 * - Denied permissions always override granted permissions.
 * - Keep legacy permission strings to avoid breaking existing apps.
 */

export const AUTH_RESOURCES = Object.freeze({
  PROFILE: 'auth.profile',
  USERS: 'auth.users',
  ROLES: 'auth.roles',
  INVITES: 'auth.invites',
  SESSIONS: 'auth.sessions',
  SECURITY: 'auth.security',
  ACCESS_REVIEWS: 'auth.accessReviews',
  AUDIT: 'audit',
})

export const AUTH_PERMISSIONS = Object.freeze({
  // Backward-compatible names.
  VIEW_USERS: 'auth.users.view',
  MANAGE_USERS: 'auth.users.manage',
  CHANGE_ROLE: 'auth.users.changeRole',
  SUSPEND_USER: 'auth.users.suspend',
  PROFILE_MANAGE: 'auth.profile.manage',

  // Profile / self-service.
  PROFILE_READ_OWN: 'auth.profile.readOwn',
  PROFILE_UPDATE_OWN: 'auth.profile.updateOwn',
  PROFILE_SECURITY_UPDATE_OWN: 'auth.profile.security.updateOwn',

  // User administration.
  USER_CREATE: 'auth.users.create',
  USER_READ: 'auth.users.view',
  USER_UPDATE: 'auth.users.update',
  USER_DISABLE: 'auth.users.disable',
  USER_RESTORE: 'auth.users.restore',
  USER_DELETE: 'auth.users.delete',
  USER_EXPORT: 'auth.users.export',

  // Privileged access administration.
  ROLE_READ: 'auth.roles.view',
  ROLE_CREATE: 'auth.roles.create',
  ROLE_UPDATE: 'auth.roles.update',
  ROLE_DELETE: 'auth.roles.delete',
  ROLE_ASSIGN: 'auth.users.changeRole',
  PERMISSION_GRANT: 'auth.permissions.grant',
  PERMISSION_DENY: 'auth.permissions.deny',

  // Invitations and onboarding.
  INVITE_CREATE: 'auth.invites.create',
  INVITE_READ: 'auth.invites.view',
  INVITE_REVOKE: 'auth.invites.revoke',
  INVITE_ACCEPT: 'auth.invites.accept',

  // Sessions.
  SESSION_READ: 'auth.sessions.view',
  SESSION_REVOKE: 'auth.sessions.revoke',
  SESSION_READ_OWN: 'auth.sessions.readOwn',

  // Security and SOC 2 evidence.
  SECURITY_POLICY_READ: 'auth.securityPolicy.view',
  SECURITY_POLICY_MANAGE: 'auth.securityPolicy.manage',
  ACCESS_REVIEW_READ: 'auth.accessReviews.view',
  ACCESS_REVIEW_MANAGE: 'auth.accessReviews.manage',
  INCIDENT_MANAGE: 'security.incidents.manage',

  // Audit feature cross-permissions.
  AUDIT_VIEW: 'audit.view',
  AUDIT_EXPORT: 'audit.export',
  AUDIT_MANAGE: 'audit.manage',
})

export const PRIVILEGED_PERMISSIONS = Object.freeze([
  AUTH_PERMISSIONS.MANAGE_USERS,
  AUTH_PERMISSIONS.CHANGE_ROLE,
  AUTH_PERMISSIONS.SUSPEND_USER,
  AUTH_PERMISSIONS.USER_CREATE,
  AUTH_PERMISSIONS.USER_UPDATE,
  AUTH_PERMISSIONS.USER_DISABLE,
  AUTH_PERMISSIONS.USER_RESTORE,
  AUTH_PERMISSIONS.USER_DELETE,
  AUTH_PERMISSIONS.USER_EXPORT,
  AUTH_PERMISSIONS.ROLE_CREATE,
  AUTH_PERMISSIONS.ROLE_UPDATE,
  AUTH_PERMISSIONS.ROLE_DELETE,
  AUTH_PERMISSIONS.ROLE_ASSIGN,
  AUTH_PERMISSIONS.PERMISSION_GRANT,
  AUTH_PERMISSIONS.PERMISSION_DENY,
  AUTH_PERMISSIONS.INVITE_CREATE,
  AUTH_PERMISSIONS.INVITE_REVOKE,
  AUTH_PERMISSIONS.SESSION_REVOKE,
  AUTH_PERMISSIONS.SECURITY_POLICY_MANAGE,
  AUTH_PERMISSIONS.ACCESS_REVIEW_MANAGE,
  AUTH_PERMISSIONS.INCIDENT_MANAGE,
  AUTH_PERMISSIONS.AUDIT_EXPORT,
  AUTH_PERMISSIONS.AUDIT_MANAGE,
])

const ALL_AUTH_PERMISSION_VALUES = Object.values(AUTH_PERMISSIONS)

export const AUTH_ROLE_LEVELS = Object.freeze({
  user: 10,
  consultant: 20,
  'consultant-editor': 25,
  receptionist: 30,
  support: 35,
  manager: 50,
  auditor: 60,
  admin: 70,
  'security-admin': 85,
  sysadmin: 100,
})

export const AUTH_ROLE_TEMPLATES = Object.freeze({
  user: [
    AUTH_PERMISSIONS.PROFILE_READ_OWN,
    AUTH_PERMISSIONS.PROFILE_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_SECURITY_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
    AUTH_PERMISSIONS.SESSION_READ_OWN,
  ],

  consultant: [
    AUTH_PERMISSIONS.PROFILE_READ_OWN,
    AUTH_PERMISSIONS.PROFILE_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_SECURITY_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
    AUTH_PERMISSIONS.SESSION_READ_OWN,
  ],

  'consultant-editor': [
    AUTH_PERMISSIONS.PROFILE_READ_OWN,
    AUTH_PERMISSIONS.PROFILE_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_SECURITY_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
    AUTH_PERMISSIONS.SESSION_READ_OWN,
  ],

  receptionist: [
    AUTH_PERMISSIONS.PROFILE_READ_OWN,
    AUTH_PERMISSIONS.PROFILE_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_SECURITY_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
    AUTH_PERMISSIONS.VIEW_USERS,
    AUTH_PERMISSIONS.USER_READ,
    AUTH_PERMISSIONS.INVITE_READ,
    AUTH_PERMISSIONS.SESSION_READ_OWN,
  ],

  support: [
    AUTH_PERMISSIONS.PROFILE_READ_OWN,
    AUTH_PERMISSIONS.PROFILE_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
    AUTH_PERMISSIONS.VIEW_USERS,
    AUTH_PERMISSIONS.USER_READ,
    AUTH_PERMISSIONS.SESSION_READ,
    AUTH_PERMISSIONS.AUDIT_VIEW,
  ],

  manager: [
    AUTH_PERMISSIONS.PROFILE_READ_OWN,
    AUTH_PERMISSIONS.PROFILE_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
    AUTH_PERMISSIONS.VIEW_USERS,
    AUTH_PERMISSIONS.USER_READ,
    AUTH_PERMISSIONS.USER_UPDATE,
    AUTH_PERMISSIONS.INVITE_CREATE,
    AUTH_PERMISSIONS.INVITE_READ,
    AUTH_PERMISSIONS.INVITE_REVOKE,
    AUTH_PERMISSIONS.SESSION_READ,
    AUTH_PERMISSIONS.AUDIT_VIEW,
    AUTH_PERMISSIONS.ACCESS_REVIEW_READ,
  ],

  auditor: [
    AUTH_PERMISSIONS.PROFILE_READ_OWN,
    AUTH_PERMISSIONS.PROFILE_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
    AUTH_PERMISSIONS.VIEW_USERS,
    AUTH_PERMISSIONS.ROLE_READ,
    AUTH_PERMISSIONS.INVITE_READ,
    AUTH_PERMISSIONS.SESSION_READ,
    AUTH_PERMISSIONS.AUDIT_VIEW,
    AUTH_PERMISSIONS.AUDIT_EXPORT,
    AUTH_PERMISSIONS.ACCESS_REVIEW_READ,
    AUTH_PERMISSIONS.SECURITY_POLICY_READ,
  ],

  admin: [
    AUTH_PERMISSIONS.PROFILE_READ_OWN,
    AUTH_PERMISSIONS.PROFILE_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_SECURITY_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
    AUTH_PERMISSIONS.VIEW_USERS,
    AUTH_PERMISSIONS.MANAGE_USERS,
    AUTH_PERMISSIONS.USER_CREATE,
    AUTH_PERMISSIONS.USER_READ,
    AUTH_PERMISSIONS.USER_UPDATE,
    AUTH_PERMISSIONS.USER_DISABLE,
    AUTH_PERMISSIONS.USER_RESTORE,
    AUTH_PERMISSIONS.CHANGE_ROLE,
    AUTH_PERMISSIONS.SUSPEND_USER,
    AUTH_PERMISSIONS.ROLE_READ,
    AUTH_PERMISSIONS.INVITE_CREATE,
    AUTH_PERMISSIONS.INVITE_READ,
    AUTH_PERMISSIONS.INVITE_REVOKE,
    AUTH_PERMISSIONS.SESSION_READ,
    AUTH_PERMISSIONS.SESSION_REVOKE,
    AUTH_PERMISSIONS.AUDIT_VIEW,
    AUTH_PERMISSIONS.ACCESS_REVIEW_READ,
  ],

  'security-admin': [
    AUTH_PERMISSIONS.PROFILE_READ_OWN,
    AUTH_PERMISSIONS.PROFILE_UPDATE_OWN,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
    AUTH_PERMISSIONS.VIEW_USERS,
    AUTH_PERMISSIONS.MANAGE_USERS,
    AUTH_PERMISSIONS.USER_CREATE,
    AUTH_PERMISSIONS.USER_READ,
    AUTH_PERMISSIONS.USER_UPDATE,
    AUTH_PERMISSIONS.USER_DISABLE,
    AUTH_PERMISSIONS.USER_RESTORE,
    AUTH_PERMISSIONS.USER_EXPORT,
    AUTH_PERMISSIONS.CHANGE_ROLE,
    AUTH_PERMISSIONS.SUSPEND_USER,
    AUTH_PERMISSIONS.ROLE_READ,
    AUTH_PERMISSIONS.ROLE_CREATE,
    AUTH_PERMISSIONS.ROLE_UPDATE,
    AUTH_PERMISSIONS.PERMISSION_GRANT,
    AUTH_PERMISSIONS.PERMISSION_DENY,
    AUTH_PERMISSIONS.INVITE_CREATE,
    AUTH_PERMISSIONS.INVITE_READ,
    AUTH_PERMISSIONS.INVITE_REVOKE,
    AUTH_PERMISSIONS.SESSION_READ,
    AUTH_PERMISSIONS.SESSION_REVOKE,
    AUTH_PERMISSIONS.SECURITY_POLICY_READ,
    AUTH_PERMISSIONS.SECURITY_POLICY_MANAGE,
    AUTH_PERMISSIONS.ACCESS_REVIEW_READ,
    AUTH_PERMISSIONS.ACCESS_REVIEW_MANAGE,
    AUTH_PERMISSIONS.INCIDENT_MANAGE,
    AUTH_PERMISSIONS.AUDIT_VIEW,
    AUTH_PERMISSIONS.AUDIT_EXPORT,
  ],

  sysadmin: ALL_AUTH_PERMISSION_VALUES,
})

export const PERMISSION_DESCRIPTIONS = Object.freeze({
  [AUTH_PERMISSIONS.VIEW_USERS]: 'View user profiles and access status.',
  [AUTH_PERMISSIONS.MANAGE_USERS]: 'Perform general user administration.',
  [AUTH_PERMISSIONS.CHANGE_ROLE]: 'Assign or change user roles within permitted level.',
  [AUTH_PERMISSIONS.SUSPEND_USER]: 'Suspend user access.',
  [AUTH_PERMISSIONS.PROFILE_MANAGE]: 'Manage own profile settings.',
  [AUTH_PERMISSIONS.PROFILE_READ_OWN]: 'Read own profile.',
  [AUTH_PERMISSIONS.PROFILE_UPDATE_OWN]: 'Update own non-security profile fields.',
  [AUTH_PERMISSIONS.PROFILE_SECURITY_UPDATE_OWN]: 'Update own password or security settings.',
  [AUTH_PERMISSIONS.USER_CREATE]: 'Create user profiles or staff accounts.',
  [AUTH_PERMISSIONS.USER_UPDATE]: 'Update user profile metadata.',
  [AUTH_PERMISSIONS.USER_DISABLE]: 'Disable active user access.',
  [AUTH_PERMISSIONS.USER_RESTORE]: 'Restore disabled users.',
  [AUTH_PERMISSIONS.USER_DELETE]: 'Delete or destroy user records where policy allows.',
  [AUTH_PERMISSIONS.USER_EXPORT]: 'Export user data.',
  [AUTH_PERMISSIONS.ROLE_READ]: 'View role catalog and role assignments.',
  [AUTH_PERMISSIONS.ROLE_CREATE]: 'Create roles.',
  [AUTH_PERMISSIONS.ROLE_UPDATE]: 'Update roles and permission bundles.',
  [AUTH_PERMISSIONS.ROLE_DELETE]: 'Delete non-system roles.',
  [AUTH_PERMISSIONS.PERMISSION_GRANT]: 'Grant direct permissions.',
  [AUTH_PERMISSIONS.PERMISSION_DENY]: 'Deny permissions explicitly.',
  [AUTH_PERMISSIONS.INVITE_CREATE]: 'Invite users.',
  [AUTH_PERMISSIONS.INVITE_READ]: 'View invitations.',
  [AUTH_PERMISSIONS.INVITE_REVOKE]: 'Revoke invitations.',
  [AUTH_PERMISSIONS.INVITE_ACCEPT]: 'Accept an invitation.',
  [AUTH_PERMISSIONS.SESSION_READ]: 'View user sessions.',
  [AUTH_PERMISSIONS.SESSION_REVOKE]: 'Revoke active sessions.',
  [AUTH_PERMISSIONS.SESSION_READ_OWN]: 'View own sessions.',
  [AUTH_PERMISSIONS.SECURITY_POLICY_READ]: 'Read security policy configuration.',
  [AUTH_PERMISSIONS.SECURITY_POLICY_MANAGE]: 'Manage security policy configuration.',
  [AUTH_PERMISSIONS.ACCESS_REVIEW_READ]: 'Read access review evidence.',
  [AUTH_PERMISSIONS.ACCESS_REVIEW_MANAGE]: 'Create and complete access reviews.',
  [AUTH_PERMISSIONS.INCIDENT_MANAGE]: 'Manage security incident workflow.',
  [AUTH_PERMISSIONS.AUDIT_VIEW]: 'View audit evidence.',
  [AUTH_PERMISSIONS.AUDIT_EXPORT]: 'Export audit evidence.',
  [AUTH_PERMISSIONS.AUDIT_MANAGE]: 'Manage audit retention and review state.',
})

export function unique(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean).map(String))]
}

export function normalizeRoleKey(role = '') {
  return String(role || '').trim().toLowerCase()
}

export function normalizeRoleKeys(roles = []) {
  return unique(roles.map(normalizeRoleKey).filter(Boolean))
}

export function normalizePermissionKeys(permissions = []) {
  return unique(permissions.map((permission) => String(permission || '').trim()).filter(Boolean))
}

export function isBreakGlassRole(role) {
  return normalizeRoleKey(role) === 'sysadmin'
}

export function isPrivilegedPermission(permission) {
  return PRIVILEGED_PERMISSIONS.includes(permission)
}

export function getRoleLevel(role, roleLevels = AUTH_ROLE_LEVELS) {
  return Number(roleLevels?.[normalizeRoleKey(role)] || 0)
}

export function getHighestRoleLevel(roles = [], roleLevels = AUTH_ROLE_LEVELS) {
  return normalizeRoleKeys(roles).reduce((highest, role) => Math.max(highest, getRoleLevel(role, roleLevels)), 0)
}

export function resolvePermissionsForRoles(roleKeys = [], roleTemplates = AUTH_ROLE_TEMPLATES) {
  const resolved = new Set()
  for (const roleKey of normalizeRoleKeys(roleKeys)) {
    for (const permission of roleTemplates?.[roleKey] || []) {
      if (permission) resolved.add(permission)
    }
  }
  return [...resolved].sort()
}

export function resolveEffectivePermissions(actor = {}, roleTemplates = AUTH_ROLE_TEMPLATES) {
  const roles = normalizeRoleKeys(actor?.roles || [actor?.role || 'user'])
  const rolePermissions = resolvePermissionsForRoles(roles, roleTemplates)
  const storedPermissions = normalizePermissionKeys(actor?.permissions || actor?.permissionKeys || [])
  const directPermissions = normalizePermissionKeys(actor?.directPermissionKeys || [])
  const deniedPermissions = new Set(normalizePermissionKeys(actor?.deniedPermissionKeys || []))

  const merged = new Set([...rolePermissions, ...storedPermissions, ...directPermissions])
  for (const denied of deniedPermissions) merged.delete(denied)

  return [...merged].sort()
}

export function hasAuthPermission(actor, permission, options = {}) {
  if (!permission) return true
  if (!actor) return false

  const status = String(actor.status || 'active').toLowerCase()
  if (options.enforceActiveStatus !== false && status !== 'active') return false

  const denied = normalizePermissionKeys(actor.deniedPermissionKeys || [])
  if (denied.includes(permission)) return false

  const roles = normalizeRoleKeys(actor.roles || [actor.role])
  if (roles.includes('sysadmin') && options.allowBreakGlass !== false) return true

  return resolveEffectivePermissions(actor, options.roleTemplates || AUTH_ROLE_TEMPLATES).includes(permission)
}

export function hasAnyAuthPermission(actor, permissions = [], options = {}) {
  const required = normalizePermissionKeys(Array.isArray(permissions) ? permissions : [permissions])
  if (!required.length) return true
  return required.some((permission) => hasAuthPermission(actor, permission, options))
}

export function hasAllAuthPermissions(actor, permissions = [], options = {}) {
  const required = normalizePermissionKeys(Array.isArray(permissions) ? permissions : [permissions])
  if (!required.length) return true
  return required.every((permission) => hasAuthPermission(actor, permission, options))
}

export function canAssignRole(actor, targetRole, options = {}) {
  if (!hasAuthPermission(actor, AUTH_PERMISSIONS.ROLE_ASSIGN, options)) return false
  const actorRoles = normalizeRoleKeys(actor?.roles || [actor?.role])
  if (actorRoles.includes('sysadmin') && options.allowBreakGlass !== false) return true

  const roleLevels = options.roleLevels || AUTH_ROLE_LEVELS
  const actorLevel = getHighestRoleLevel(actorRoles, roleLevels)
  const targetLevel = getRoleLevel(targetRole, roleLevels)
  return targetLevel > 0 && targetLevel < actorLevel
}

export default {
  module: 'auth',
  permissions: ALL_AUTH_PERMISSION_VALUES.map((key) => ({
    key,
    resource: key.split('.').slice(0, -1).join('.') || 'general',
    action: key.split('.').at(-1) || '',
    description: PERMISSION_DESCRIPTIONS[key] || `Auth permission ${key}`,
    privileged: isPrivilegedPermission(key),
  })),
  roleTemplates: AUTH_ROLE_TEMPLATES,
  roleLevels: AUTH_ROLE_LEVELS,
}
