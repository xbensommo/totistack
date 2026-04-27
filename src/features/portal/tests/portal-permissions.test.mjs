import test from 'node:test'
import assert from 'node:assert/strict'
import { PORTAL_PERMISSIONS, canAccessMembership, hasPortalPermission } from '../permissions.js'

test('portal permission templates work for customer roles', () => {
  const actor = { roles: ['customer'], permissions: [] }
  assert.equal(hasPortalPermission(actor, PORTAL_PERMISSIONS.VIEW_SELF), true)
  assert.equal(hasPortalPermission(actor, PORTAL_PERMISSIONS.ADMIN_MANAGE), false)
})

test('membership access is scoped to the linked user by default', () => {
  const actor = { id: 'user_1', roles: ['customer'] }
  const membership = { externalUserId: 'user_1' }
  assert.equal(canAccessMembership(actor, membership), true)
  assert.equal(canAccessMembership({ id: 'user_2', roles: ['customer'] }, membership), false)
})
