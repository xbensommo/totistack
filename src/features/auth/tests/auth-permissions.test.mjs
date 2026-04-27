import test from 'node:test'
import assert from 'node:assert/strict'
import { AUTH_PERMISSIONS, hasAuthPermission } from '../permissions.js'

test('auth permission helper grants sysadmin access', () => {
  assert.equal(hasAuthPermission({ roles: ['sysadmin'] }, AUTH_PERMISSIONS.SUSPEND_USER), true)
})

test('auth permission helper checks explicit permissions', () => {
  assert.equal(hasAuthPermission({ permissions: [AUTH_PERMISSIONS.CHANGE_ROLE] }, AUTH_PERMISSIONS.CHANGE_ROLE), true)
})
