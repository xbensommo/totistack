import test from 'node:test'
import assert from 'node:assert/strict'
import {
  AUTH_PERMISSIONS,
  canAssignRole,
  hasAllAuthPermissions,
  hasAuthPermission,
  resolveEffectivePermissions,
} from '../permissions.js'

test('auth permission helper grants sysadmin break-glass access', () => {
  assert.equal(hasAuthPermission({ roles: ['sysadmin'], status: 'active' }, AUTH_PERMISSIONS.SUSPEND_USER), true)
})

test('auth permission helper checks explicit permissions', () => {
  assert.equal(hasAuthPermission({ permissions: [AUTH_PERMISSIONS.CHANGE_ROLE], status: 'active' }, AUTH_PERMISSIONS.CHANGE_ROLE), true)
})

test('denied permissions override role and direct grants', () => {
  const actor = {
    roles: ['admin'],
    directPermissionKeys: [AUTH_PERMISSIONS.USER_DELETE],
    deniedPermissionKeys: [AUTH_PERMISSIONS.USER_DELETE],
    status: 'active',
  }
  assert.equal(resolveEffectivePermissions(actor).includes(AUTH_PERMISSIONS.USER_DELETE), false)
  assert.equal(hasAuthPermission(actor, AUTH_PERMISSIONS.USER_DELETE), false)
})

test('inactive accounts are denied even when permissions exist', () => {
  const actor = { roles: ['sysadmin'], status: 'suspended' }
  assert.equal(hasAuthPermission(actor, AUTH_PERMISSIONS.AUDIT_MANAGE), false)
})

test('hasAllAuthPermissions requires every permission', () => {
  const actor = { roles: ['auditor'], status: 'active' }
  assert.equal(hasAllAuthPermissions(actor, [AUTH_PERMISSIONS.AUDIT_VIEW, AUTH_PERMISSIONS.AUDIT_EXPORT]), true)
  assert.equal(hasAllAuthPermissions(actor, [AUTH_PERMISSIONS.AUDIT_VIEW, AUTH_PERMISSIONS.USER_DELETE]), false)
})

test('role assignment cannot assign equal or higher privilege roles', () => {
  const admin = { roles: ['admin'], status: 'active' }
  assert.equal(canAssignRole(admin, 'consultant'), true)
  assert.equal(canAssignRole(admin, 'admin'), false)
  assert.equal(canAssignRole(admin, 'security-admin'), false)
})
