/**
 * @file functions/src/auth/authz.js
 * @description Server-side RBAC, role hierarchy, signup policy, and custom-claim helpers.
 *
 * Keep this server-side file authoritative. Frontend permission catalogs may mirror it for UI,
 * but backend functions must not trust browser-supplied roles or permissions.
 */

export const AUTH_PERMISSIONS = Object.freeze({
  VIEW_USERS: 'auth.users.view',
  MANAGE_USERS: 'auth.users.manage',
  CHANGE_ROLE: 'auth.users.changeRole',
  SUSPEND_USER: 'auth.users.suspend',
  PROFILE_MANAGE: 'auth.profile.manage',
  PROFILE_READ_OWN: 'auth.profile.readOwn',
  PROFILE_UPDATE_OWN: 'auth.profile.updateOwn',
  PROFILE_SECURITY_UPDATE_OWN: 'auth.profile.security.updateOwn',
  USER_CREATE: 'auth.users.create',
  USER_READ: 'auth.users.view',
  USER_UPDATE: 'auth.users.update',
  USER_DISABLE: 'auth.users.disable',
  USER_RESTORE: 'auth.users.restore',
  USER_DELETE: 'auth.users.delete',
  USER_EXPORT: 'auth.users.export',
  ROLE_READ: 'auth.roles.view',
  ROLE_CREATE: 'auth.roles.create',
  ROLE_UPDATE: 'auth.roles.update',
  ROLE_DELETE: 'auth.roles.delete',
  ROLE_ASSIGN: 'auth.users.changeRole',
  PERMISSION_GRANT: 'auth.permissions.grant',
  PERMISSION_DENY: 'auth.permissions.deny',
  INVITE_CREATE: 'auth.invites.create',
  INVITE_READ: 'auth.invites.view',
  INVITE_REVOKE: 'auth.invites.revoke',
  INVITE_ACCEPT: 'auth.invites.accept',
  SESSION_READ: 'auth.sessions.view',
  SESSION_REVOKE: 'auth.sessions.revoke',
  SESSION_READ_OWN: 'auth.sessions.readOwn',
  SECURITY_POLICY_READ: 'auth.securityPolicy.view',
  SECURITY_POLICY_MANAGE: 'auth.securityPolicy.manage',
  ACCESS_REVIEW_READ: 'auth.accessReviews.view',
  ACCESS_REVIEW_MANAGE: 'auth.accessReviews.manage',
  INCIDENT_MANAGE: 'security.incidents.manage',
  AUDIT_VIEW: 'audit.view',
  AUDIT_EXPORT: 'audit.export',
  AUDIT_MANAGE: 'audit.manage',
})

export const ALL_AUTH_PERMISSION_VALUES = Object.freeze(Object.values(AUTH_PERMISSIONS))

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

export const SYSTEM_ROLES = Object.freeze(Object.keys(AUTH_ROLE_LEVELS))
export const BREAK_GLASS_ROLES = Object.freeze(['sysadmin'])
export const PRIVILEGED_ROLES = Object.freeze(['admin', 'security-admin', 'sysadmin'])
export const CLAIMS_SCHEMA_VERSION = 1
export const MAX_CUSTOM_CLAIMS_BYTES = 950

export const ACCESS_FIELDS = Object.freeze([
  'role',
  'roles',
  'permissions',
  'permissionKeys',
  'directPermissionKeys',
  'deniedPermissionKeys',
  'accessVersion',
  'lastAccessChangedAt',
  'lastAccessChangedBy',
  'mfaRequired',
  'riskLevel',
  'status',
])

export function unique(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean).map(String))]
}

export function normalizeRoleKey(role = '') {
  return String(role || '').trim().toLowerCase()
}

export function normalizeRoleKeys(roles = []) {
  return unique((Array.isArray(roles) ? roles : [roles]).map(normalizeRoleKey).filter(Boolean))
}

export function normalizePermissionKeys(permissions = []) {
  return unique((Array.isArray(permissions) ? permissions : [permissions]).map((permission) => String(permission || '').trim()).filter(Boolean))
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

export function hasPermission(actor = {}, permission = '') {
  if (!permission) return true
  if (!actor) return false
  if (String(actor.status || 'active').toLowerCase() !== 'active') return false
  const denied = normalizePermissionKeys(actor.deniedPermissionKeys || [])
  if (denied.includes(permission)) return false
  const roles = normalizeRoleKeys(actor.roles || [actor.role])
  if (roles.includes('sysadmin')) return true
  return resolveEffectivePermissions(actor).includes(permission)
}

export function assertPermission(actor, permission) {
  if (!hasPermission(actor, permission)) {
    const error = new Error(`Missing required permission: ${permission}`)
    error.code = 'permission-denied'
    error.permission = permission
    throw error
  }
}

export function canAssignRole(actor = {}, targetRole = '') {
  if (!hasPermission(actor, AUTH_PERMISSIONS.ROLE_ASSIGN)) return false
  const actorRoles = normalizeRoleKeys(actor?.roles || [actor?.role])
  if (actorRoles.includes('sysadmin')) return true
  const actorLevel = getHighestRoleLevel(actorRoles)
  const targetLevel = getRoleLevel(targetRole)
  return targetLevel > 0 && targetLevel < actorLevel
}

export function assertCanAssignRole(actor, targetRole) {
  if (!canAssignRole(actor, targetRole)) {
    const error = new Error(`Role assignment denied for target role: ${targetRole}`)
    error.code = 'permission-denied'
    error.targetRole = targetRole
    throw error
  }
}

export function stripAccessFields(payload = {}) {
  const safe = { ...payload }
  for (const field of ACCESS_FIELDS) delete safe[field]
  return safe
}

export function pickProfileFields(payload = {}) {
  const allowed = ['displayName', 'firstName', 'lastName', 'phoneNumber', 'photoURL', 'department', 'jobTitle', 'termsAcceptedAt']
  return allowed.reduce((next, key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) next[key] = payload[key]
    return next
  }, {})
}

export function buildClaimsFromProfile(profile = {}) {
  const roles = normalizeRoleKeys(profile.roles || [profile.role || 'user'])
  const deniedPermissionKeys = normalizePermissionKeys(profile.deniedPermissionKeys || [])
  const permissions = resolveEffectivePermissions({
    role: roles[0] || 'user',
    roles,
    permissions: profile.permissions || profile.permissionKeys || [],
    directPermissionKeys: profile.directPermissionKeys || [],
    deniedPermissionKeys,
    status: profile.status || 'active',
  })

  const claims = {
    roles,
    permissions,
    deniedPermissionKeys,
    accessVersion: Number(profile.accessVersion || 1),
    status: String(profile.status || 'active').toLowerCase(),
    mfaRequired: Boolean(profile.mfaRequired),
    mfaEnrolled: Boolean(profile.mfaEnrolled),
    authzVersion: CLAIMS_SCHEMA_VERSION,
  }

  const bytes = Buffer.byteLength(JSON.stringify(claims), 'utf8')
  if (bytes > MAX_CUSTOM_CLAIMS_BYTES) {
    const error = new Error(`Custom claims payload is too large: ${bytes} bytes.`)
    error.code = 'failed-precondition'
    error.claimBytes = bytes
    throw error
  }

  return claims
}

export function buildRoleProfile({ role = 'user', roles = [], directPermissionKeys = [], deniedPermissionKeys = [], mfaRequired = false } = {}) {
  const normalizedRoles = normalizeRoleKeys(roles.length ? roles : [role || 'user'])
  const primaryRole = normalizedRoles[0] || 'user'
  const rolePermissions = resolvePermissionsForRoles(normalizedRoles)
  const direct = normalizePermissionKeys(directPermissionKeys)
  const denied = normalizePermissionKeys(deniedPermissionKeys)
  const permissions = resolveEffectivePermissions({ roles: normalizedRoles, directPermissionKeys: direct, deniedPermissionKeys: denied })

  return {
    role: primaryRole,
    roles: normalizedRoles,
    permissions,
    permissionKeys: rolePermissions,
    directPermissionKeys: direct,
    deniedPermissionKeys: denied,
    mfaRequired: Boolean(mfaRequired || PRIVILEGED_ROLES.some((item) => normalizedRoles.includes(item))),
  }
}

export function isValidRole(role) {
  return SYSTEM_ROLES.includes(normalizeRoleKey(role))
}
