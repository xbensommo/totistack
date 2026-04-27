/** @file src/features/auth/services/create-auth-role-profile.js */

function unique(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))]
}

export function resolvePermissionsForRoles(roleKeys = [], roleTemplates = {}) {
  const resolved = new Set()
  for (const roleKey of unique(roleKeys)) {
    for (const permission of roleTemplates?.[roleKey] || []) {
      if (permission) resolved.add(permission)
    }
  }
  return [...resolved].sort()
}

export function buildAuthRoleProfile({ existing = null, profileData = {}, config = {} } = {}) {
  const fallbackRole = config?.rbac?.defaultRole || 'user'
  const roleTemplates = config?.rbac?.roleTemplates || config?.roleTemplates || {}
  const explicitPermissions = unique(existing?.permissions || profileData.permissions || [])

  const resolvedRole = existing?.role || profileData.role || fallbackRole
  const resolvedRoles = unique(existing?.roles || profileData.roles || [resolvedRole])
  const derivedPermissions = explicitPermissions.length
    ? explicitPermissions
    : (typeof config?.resolvePermissionsForRoles === 'function'
      ? unique(config.resolvePermissionsForRoles(resolvedRoles, roleTemplates) || [])
      : resolvePermissionsForRoles(resolvedRoles, roleTemplates))

  return {
    role: resolvedRole,
    roles: resolvedRoles,
    permissions: derivedPermissions,
  }
}

export default buildAuthRoleProfile
