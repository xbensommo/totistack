/**
 * @file src/features/auth/services/create-auth-role-profile.js
 * @description Builds safe role/permission profiles without trusting browser-supplied access fields.
 */

import {
  AUTH_ROLE_TEMPLATES,
  normalizePermissionKeys,
  normalizeRoleKey,
  normalizeRoleKeys,
  resolveEffectivePermissions,
  resolvePermissionsForRoles,
} from '../permissions.js'

const ACCESS_FIELD_NAMES = Object.freeze([
  'role',
  'roles',
  'permissions',
  'permissionKeys',
  'directPermissionKeys',
  'deniedPermissionKeys',
])

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key)
}

export function stripAccessFields(payload = {}) {
  const clean = { ...(payload || {}) }
  for (const field of ACCESS_FIELD_NAMES) delete clean[field]
  return clean
}

function accessInputIsTrusted(config = {}, context = {}) {
  // Browser self-registration must never set its own roles/permissions.
  // Trust should only be enabled from a server-side onboarding or invite acceptance flow.
  return Boolean(context?.trustedAccess === true || config?.rbac?.trustProfileAccessFields === true)
}

export function buildAuthRoleProfile({ existing = null, profileData = {}, config = {}, context = {} } = {}) {
  const fallbackRole = normalizeRoleKey(config?.rbac?.defaultRole || 'user') || 'user'
  const roleTemplates = config?.rbac?.roleTemplates || config?.roleTemplates || AUTH_ROLE_TEMPLATES
  const trustedProfileAccess = accessInputIsTrusted(config, context)

  const source = existing || (trustedProfileAccess ? profileData : {})
  const resolvedRole = normalizeRoleKey(source?.role || fallbackRole)
  const resolvedRoles = normalizeRoleKeys(source?.roles?.length ? source.roles : [resolvedRole])
  const safeRoles = resolvedRoles.length ? resolvedRoles : [fallbackRole]

  const storedPermissions = normalizePermissionKeys(source?.permissions || source?.permissionKeys || [])
  const directPermissionKeys = normalizePermissionKeys(source?.directPermissionKeys || [])
  const deniedPermissionKeys = normalizePermissionKeys(source?.deniedPermissionKeys || [])

  const derivedPermissions = storedPermissions.length
    ? storedPermissions
    : (typeof config?.resolvePermissionsForRoles === 'function'
      ? normalizePermissionKeys(config.resolvePermissionsForRoles(safeRoles, roleTemplates) || [])
      : resolvePermissionsForRoles(safeRoles, roleTemplates))

  const permissions = resolveEffectivePermissions({
    role: safeRoles[0],
    roles: safeRoles,
    permissions: derivedPermissions,
    directPermissionKeys,
    deniedPermissionKeys,
    status: existing?.status || profileData?.status || 'active',
  }, roleTemplates)

  return {
    role: safeRoles[0],
    roles: safeRoles,
    permissions,
    permissionKeys: permissions,
    directPermissionKeys,
    deniedPermissionKeys,
    accessSource: existing ? 'stored-profile' : (trustedProfileAccess ? 'trusted-profile-data' : 'default-role'),
    ignoredAccessFields: !existing && !trustedProfileAccess
      ? ACCESS_FIELD_NAMES.filter((field) => hasOwn(profileData, field))
      : [],
  }
}

export { resolvePermissionsForRoles }
export default buildAuthRoleProfile
