import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_PORTAL_PROFILE_KEY, getPortalProfileActions, resolvePortalProfile } from '../business/default-profile.js'

test('portal profiles resolve safely', () => {
  assert.equal(resolvePortalProfile().key, DEFAULT_PORTAL_PROFILE_KEY)
  assert.equal(resolvePortalProfile('student').key, 'student')
  assert.equal(resolvePortalProfile('unknown').key, DEFAULT_PORTAL_PROFILE_KEY)
})

test('portal profiles expose actions', () => {
  const actions = getPortalProfileActions('client')
  assert.ok(actions.requestSupport)
  assert.ok(actions.approveMilestone)
})
