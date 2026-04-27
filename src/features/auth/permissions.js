/** @file src/features/auth/permissions.js */

export const AUTH_PERMISSIONS = Object.freeze({
  VIEW_USERS: 'auth.users.view',
  MANAGE_USERS: 'auth.users.manage',
  CHANGE_ROLE: 'auth.users.changeRole',
  SUSPEND_USER: 'auth.users.suspend',
  PROFILE_MANAGE: 'auth.profile.manage',
})

export const AUTH_ROLE_TEMPLATES = Object.freeze({
  admin: Object.values(AUTH_PERMISSIONS),
  sysadmin: Object.values(AUTH_PERMISSIONS),
  receptionist: [
    AUTH_PERMISSIONS.VIEW_USERS,
    AUTH_PERMISSIONS.CHANGE_ROLE,
    AUTH_PERMISSIONS.PROFILE_MANAGE,
  ],
  consultant: [AUTH_PERMISSIONS.PROFILE_MANAGE],
  'consultant-editor': [AUTH_PERMISSIONS.PROFILE_MANAGE],
})

export function hasAuthPermission(actor, permission) {
  const roles = Array.isArray(actor?.roles) ? actor.roles : []
  const permissions = Array.isArray(actor?.permissions) ? actor.permissions : []
  return permissions.includes(permission) || roles.includes('admin') || roles.includes('sysadmin')
}

export default {
  module: 'auth',
  permissions: Object.values(AUTH_PERMISSIONS).map((key) => ({
    key,
    resource: key.split('.').slice(1, -1).join('.') || 'general',
    action: key.split('.').at(-1) || '',
    description: `Auth permission ${key}`,
  })),
  roleTemplates: AUTH_ROLE_TEMPLATES,
}
