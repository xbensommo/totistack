import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ALL_AUTH_PERMISSION_VALUES,
  AUTH_PERMISSIONS,
  buildClaimsFromProfile,
  buildRoleProfile,
  canAssignRole,
  hasPermission,
  stripAccessFields,
} from '../src/auth/authz.js'

test('server authz strips browser-supplied access fields', () => {
  assert.deepEqual(stripAccessFields({ displayName: 'A', role: 'sysadmin', permissions: ['*'] }), { displayName: 'A' })
})

test('server authz denies explicit denied permission even for sysadmin when status inactive', () => {
  assert.equal(hasPermission({ role: 'sysadmin', roles: ['sysadmin'], status: 'suspended' }, AUTH_PERMISSIONS.AUDIT_MANAGE), false)
})

test('server authz role hierarchy blocks admin assigning security-admin', () => {
  assert.equal(canAssignRole({ roles: ['admin'], status: 'active' }, 'manager'), true)
  assert.equal(canAssignRole({ roles: ['admin'], status: 'active' }, 'security-admin'), false)
})

test('server role profile derives least privilege for invite-created user', () => {
  const profile = buildRoleProfile({ role: 'receptionist' })
  assert.equal(profile.role, 'receptionist')
  assert.equal(profile.permissions.includes(AUTH_PERMISSIONS.USER_READ), true)
  assert.equal(profile.permissions.includes(AUTH_PERMISSIONS.ROLE_ASSIGN), false)
})

test('server custom claims stay compact for built-in sysadmin', () => {
  const claims = buildClaimsFromProfile({
    role: 'sysadmin',
    roles: ['sysadmin'],
    permissions: ALL_AUTH_PERMISSION_VALUES,
    status: 'active',
    mfaRequired: true,
    accessVersion: 1,
  })
  assert.equal(claims.roles.includes('sysadmin'), true)
  assert.equal(Buffer.byteLength(JSON.stringify(claims), 'utf8') < 950, true)
})
