import test from 'node:test'
import assert from 'node:assert/strict'
import { ORDER_PERMISSIONS, canAccessOrder, getUserPermissions, getUserRoles, isOrderOwner } from '../permissions.js'

test('getUserRoles merges role and roles cleanly', () => {
  const roles = getUserRoles({ role: 'manager', roles: ['manager', 'admin'] })
  assert.deepEqual(roles.sort(), ['admin', 'manager'])
})

test('getUserPermissions expands role permissions', () => {
  const permissions = getUserPermissions({ role: 'manager' })
  assert.ok(permissions.includes(ORDER_PERMISSIONS.CREATE))
  assert.ok(permissions.includes(ORDER_PERMISSIONS.MARK_PAID))
})

test('isOrderOwner detects placedById', () => {
  assert.equal(isOrderOwner({ uid: 'u1' }, { placedById: 'u1' }), true)
  assert.equal(isOrderOwner({ uid: 'u2' }, { placedById: 'u1' }), false)
})

test('owner-based view access works for view_own users', () => {
  const user = { uid: 'u1', role: 'user' }
  const order = { placedById: 'u1' }
  assert.equal(canAccessOrder(user, ORDER_PERMISSIONS.VIEW, order), true)
  assert.equal(canAccessOrder(user, ORDER_PERMISSIONS.VIEW, { placedById: 'u9' }), false)
})
