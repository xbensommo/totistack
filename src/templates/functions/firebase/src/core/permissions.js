/** @file functions/src/core/permissions.js */

import { fail } from './errors.js'

function normalizeList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') return [value]
  if (typeof value === 'object') return Object.keys(value).filter((key) => value[key])
  return []
}

export function getPermissionSet(auth) {
  const token = auth?.token || {}
  const permissions = new Set([
    ...normalizeList(token.permissions),
    ...normalizeList(token.permissionKeys),
    ...normalizeList(token.directPermissionKeys),
  ])

  const roles = new Set([
    ...normalizeList(token.roles),
    ...normalizeList(token.role),
  ])

  return { permissions, roles }
}

export function hasPermission(auth, permission) {
  if (!permission) return true
  const { permissions, roles } = getPermissionSet(auth)
  return permissions.has(permission) || roles.has('admin') || roles.has('sysadmin')
}

export function assertPermission(auth, permission) {
  if (!hasPermission(auth, permission)) {
    fail('permission-denied', `Missing permission: ${permission}`)
  }
}
