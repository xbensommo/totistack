import test from 'node:test'
import assert from 'node:assert/strict'
import { CMS_PERMISSIONS, hasCmsPermission } from '../permissions.js'

test('cms permission helper grants admin access', () => {
  assert.equal(hasCmsPermission({ roles: ['admin'], permissions: [] }, CMS_PERMISSIONS.PAGES_DELETE), true)
})

test('cms permission helper denies missing permission', () => {
  assert.equal(hasCmsPermission({ roles: ['consultant'], permissions: [] }, CMS_PERMISSIONS.PAGES_DELETE), false)
})
