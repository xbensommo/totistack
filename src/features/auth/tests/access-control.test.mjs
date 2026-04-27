import test from 'node:test'
import assert from 'node:assert/strict'
import { AUTH_PERMISSIONS } from '../permissions.js'
import { buildAccessContext, evaluateAccess } from '../services/access-control.service.js'

test('buildAccessContext resolves permissions from stored profile', () => {
  const ctx = buildAccessContext({
    firebaseUser: { uid: 'u1', email: 'a@example.com', emailVerified: true },
    profile: { role: 'auditor', roles: ['auditor'], status: 'active' },
  })
  assert.equal(ctx.uid, 'u1')
  assert.equal(ctx.permissions.includes(AUTH_PERMISSIONS.AUDIT_VIEW), true)
})

test('evaluateAccess denies unauthenticated actor', () => {
  const decision = evaluateAccess({ actor: null, routeMeta: { requiresAuth: true } })
  assert.equal(decision.allowed, false)
  assert.equal(decision.reason, 'AUTH_REQUIRED')
})

test('evaluateAccess denies missing permission', () => {
  const decision = evaluateAccess({
    actor: { uid: 'u1', roles: ['consultant'], status: 'active' },
    routeMeta: { requiresAuth: true, permissions: [AUTH_PERMISSIONS.USER_DELETE] },
  })
  assert.equal(decision.allowed, false)
  assert.equal(decision.reason, 'PERMISSION_REQUIRED')
})

test('evaluateAccess allows permission route for auditor', () => {
  const decision = evaluateAccess({
    actor: { uid: 'u1', roles: ['auditor'], status: 'active' },
    routeMeta: { requiresAuth: true, permissions: [AUTH_PERMISSIONS.AUDIT_VIEW] },
  })
  assert.equal(decision.allowed, true)
})

test('evaluateAccess enforces MFA metadata', () => {
  const decision = evaluateAccess({
    actor: { uid: 'u1', roles: ['security-admin'], status: 'active', mfaEnrolled: false },
    routeMeta: { requiresAuth: true, requiresMfa: true, permissions: [AUTH_PERMISSIONS.SECURITY_POLICY_MANAGE] },
  })
  assert.equal(decision.allowed, false)
  assert.equal(decision.reason, 'MFA_REQUIRED')
})
