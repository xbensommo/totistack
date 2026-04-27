import test from 'node:test'
import assert from 'node:assert/strict'
import { AUTH_PERMISSIONS } from '../permissions.js'
import { buildAuthRoleProfile, resolvePermissionsForRoles, stripAccessFields } from '../services/create-auth-role-profile.js'

test('resolvePermissionsForRoles merges role templates', () => {
  const permissions = resolvePermissionsForRoles(['receptionist', 'consultant'], {
    receptionist: ['crm.leads.read', 'auth.users.view'],
    consultant: ['crm.tasks.read'],
  })
  assert.deepEqual(permissions, ['auth.users.view', 'crm.leads.read', 'crm.tasks.read'])
})

test('buildAuthRoleProfile derives permissions when explicit permissions are absent', () => {
  const profile = buildAuthRoleProfile({
    profileData: { role: 'receptionist' },
    config: { rbac: { trustProfileAccessFields: true }, roleTemplates: { receptionist: ['notifications.view', 'crm.leads.read'] } },
  })
  assert.equal(profile.role, 'receptionist')
  assert.deepEqual(profile.roles, ['receptionist'])
  assert.deepEqual(profile.permissions, ['crm.leads.read', 'notifications.view'])
})

test('self-registration ignores client-supplied privileged access fields by default', () => {
  const profile = buildAuthRoleProfile({
    profileData: {
      role: 'sysadmin',
      roles: ['sysadmin'],
      permissions: [AUTH_PERMISSIONS.AUDIT_MANAGE],
      directPermissionKeys: [AUTH_PERMISSIONS.USER_DELETE],
    },
    config: { rbac: { defaultRole: 'user' } },
  })

  assert.equal(profile.role, 'user')
  assert.deepEqual(profile.roles, ['user'])
  assert.equal(profile.permissions.includes(AUTH_PERMISSIONS.USER_DELETE), false)
  assert.equal(profile.ignoredAccessFields.includes('role'), true)
  assert.equal(profile.ignoredAccessFields.includes('permissions'), true)
})

test('stored profile access fields are trusted because persistence is source of truth', () => {
  const profile = buildAuthRoleProfile({
    existing: {
      role: 'auditor',
      roles: ['auditor'],
      deniedPermissionKeys: [AUTH_PERMISSIONS.AUDIT_EXPORT],
    },
  })

  assert.equal(profile.role, 'auditor')
  assert.equal(profile.permissions.includes(AUTH_PERMISSIONS.AUDIT_VIEW), true)
  assert.equal(profile.permissions.includes(AUTH_PERMISSIONS.AUDIT_EXPORT), false)
})

test('stripAccessFields removes privilege-bearing fields', () => {
  assert.deepEqual(stripAccessFields({ displayName: 'A', role: 'admin', permissionKeys: ['x'] }), { displayName: 'A' })
})
