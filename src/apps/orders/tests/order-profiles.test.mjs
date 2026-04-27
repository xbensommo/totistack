import test from 'node:test'
import assert from 'node:assert/strict'
import { ORDER_BUSINESS_PROFILES, resolveOrderBusinessProfile } from '../business/default-profile.js'

test('resolves known business profiles', () => {
  assert.equal(resolveOrderBusinessProfile('totisoft').code, 'totisoft')
  assert.equal(resolveOrderBusinessProfile('eduprolic').code, 'eduprolic')
})

test('falls back to generic profile', () => {
  assert.equal(resolveOrderBusinessProfile('unknown').code, 'generic')
})

test('profile registry is exposed', () => {
  assert.ok(ORDER_BUSINESS_PROFILES.generic)
  assert.ok(ORDER_BUSINESS_PROFILES.totisoft)
  assert.ok(ORDER_BUSINESS_PROFILES.eduprolic)
})
