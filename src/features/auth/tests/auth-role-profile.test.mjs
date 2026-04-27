import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAuthRoleProfile, resolvePermissionsForRoles } from '../services/create-auth-role-profile.js'

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
    config: { roleTemplates: { receptionist: ['notifications.view', 'crm.leads.read'] } },
  })
  assert.equal(profile.role, 'receptionist')
  assert.deepEqual(profile.roles, ['receptionist'])
  assert.deepEqual(profile.permissions, ['crm.leads.read', 'notifications.view'])
})
