/**
 * @file functions/src/auth/security-utils.js
 * @description Security utility functions for callable auth control-plane functions.
 */

import crypto from 'node:crypto'
import { HttpsError } from 'firebase-functions/v2/https'
import { adminAuth, db, FieldValue } from '../firebase-admin.js'
import {
  AUTH_PERMISSIONS,
  assertPermission,
  buildClaimsFromProfile,
  buildRoleProfile,
  normalizeRoleKey,
  normalizeRoleKeys,
  pickProfileFields,
  stripAccessFields,
} from './authz.js'

const DEFAULT_POLICY = Object.freeze({
  code: 'auth.default',
  name: 'Default Auth Security Policy',
  version: '1.0.0',
  status: 'active',
  allowPublicSignup: false,
  inviteOnly: true,
  defaultSignupRole: 'user',
  allowedEmailDomains: [],
  mfaRequiredForRoles: ['admin', 'security-admin', 'sysadmin'],
  sessionTtlMinutes: 480,
  privilegedAccessRequiresApproval: true,
})

const SENSITIVE_AUDIT_KEYS = new Set([
  'password',
  'passcode',
  'token',
  'invitetoken',
  'refreshtoken',
  'accesstoken',
  'idtoken',
  'secret',
  'apikey',
  'authorization',
  'cookie',
  'session',
])

function shouldRedactAuditKey(key = '') {
  const normalized = String(key).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return SENSITIVE_AUDIT_KEYS.has(normalized) || [...SENSITIVE_AUDIT_KEYS].some((item) => normalized.includes(item))
}

export function sanitizeForAudit(value, depth = 0) {
  if (value == null) return value
  if (depth > 6) return '[MaxDepth]'
  if (Array.isArray(value)) return value.map((item) => sanitizeForAudit(item, depth + 1))
  if (typeof value !== 'object') return value
  if (value instanceof Date) return value.toISOString()

  const output = {}
  for (const [key, child] of Object.entries(value)) {
    output[key] = shouldRedactAuditKey(key) ? '[REDACTED]' : sanitizeForAudit(child, depth + 1)
  }
  return output
}

export function toHttpsError(error, fallbackCode = 'internal') {
  if (error instanceof HttpsError) return error
  const code = error?.code || fallbackCode
  const validCodes = new Set([
    'ok', 'cancelled', 'unknown', 'invalid-argument', 'deadline-exceeded', 'not-found', 'already-exists',
    'permission-denied', 'resource-exhausted', 'failed-precondition', 'aborted', 'out-of-range', 'unimplemented',
    'internal', 'unavailable', 'data-loss', 'unauthenticated',
  ])
  return new HttpsError(validCodes.has(code) ? code : fallbackCode, error?.message || 'Request failed.', error?.details || undefined)
}

export function hashToken(token = '') {
  return crypto.createHash('sha256').update(String(token)).digest('hex')
}

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

export function normalizeEmail(email = '') {
  return String(email || '').trim().toLowerCase()
}

export function assertAuthenticated(request) {
  if (!request?.auth?.uid) throw new HttpsError('unauthenticated', 'Authentication is required.')
  return request.auth
}

export async function getUserProfile(uid) {
  const snap = await db.collection('users').doc(uid).get()
  if (!snap.exists) return null
  return { id: snap.id, uid: snap.id, ...snap.data() }
}

export async function requireActor(request, permission) {
  const auth = assertAuthenticated(request)
  const actor = await getUserProfile(auth.uid)
  if (!actor) throw new HttpsError('permission-denied', 'The signed-in user has no authorization profile.')
  if (String(actor.status || 'active').toLowerCase() !== 'active') {
    throw new HttpsError('permission-denied', 'The signed-in user is not active.')
  }
  if (permission) {
    try {
      assertPermission(actor, permission)
    } catch (error) {
      throw toHttpsError(error, 'permission-denied')
    }
  }
  return actor
}

export async function getActiveSecurityPolicy() {
  const direct = await db.collection('security_policies').doc('auth.default').get()
  if (direct.exists) return { ...DEFAULT_POLICY, ...direct.data(), id: direct.id }

  const query = await db.collection('security_policies')
    .where('code', '==', 'auth.default')
    .where('status', '==', 'active')
    .limit(1)
    .get()

  if (!query.empty) {
    const doc = query.docs[0]
    return { ...DEFAULT_POLICY, ...doc.data(), id: doc.id }
  }

  return DEFAULT_POLICY
}

export function assertEmailAllowed(email, policy) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new HttpsError('invalid-argument', 'A valid email address is required.')
  }

  const allowedEmailDomains = Array.isArray(policy?.allowedEmailDomains) ? policy.allowedEmailDomains.filter(Boolean) : []
  if (!allowedEmailDomains.length) return

  const domain = normalizedEmail.split('@').at(1)
  if (!domain || !allowedEmailDomains.map((item) => String(item).toLowerCase()).includes(domain)) {
    throw new HttpsError('permission-denied', 'This email domain is not allowed by the active signup policy.')
  }
}

export async function writeAuditEvent(payload = {}) {
  const now = FieldValue.serverTimestamp()
  const ref = db.collection('auditLogs').doc()
  const event = {
    actorId: payload.actorId || null,
    actorEmail: payload.actorEmail || null,
    actorRoles: payload.actorRoles || [],
    actionId: payload.actionId || 'security.event',
    category: payload.category || 'security',
    controlId: payload.controlId || 'CC6.1',
    operationId: payload.operationId || ref.id,
    correlationId: payload.correlationId || payload.operationId || ref.id,
    entityType: payload.entityType || null,
    entityId: payload.entityId || null,
    resource: payload.resource || null,
    source: payload.source || 'cloud-functions',
    status: payload.status || 'success',
    severity: payload.severity || 'info',
    policyDecision: payload.policyDecision || null,
    reason: payload.reason || null,
    before: sanitizeForAudit(payload.before || null),
    after: sanitizeForAudit(payload.after || null),
    changes: sanitizeForAudit(payload.changes || []),
    request: sanitizeForAudit(payload.request || null),
    result: sanitizeForAudit(payload.result || null),
    errorCode: payload.errorCode || null,
    errorMessage: payload.errorMessage || null,
    retentionClass: payload.retentionClass || 'security-7y',
    reviewStatus: payload.reviewStatus || 'unreviewed',
    meta: sanitizeForAudit(payload.meta || {}),
    isDeleted: false,
    createdAt: now,
  }
  const evidenceHash = crypto.createHash('sha256').update(JSON.stringify({ ...event, createdAt: 'serverTimestamp' })).digest('hex')
  await ref.set({ ...event, evidenceHash })
  return { id: ref.id, evidenceHash }
}

export async function syncClaimsForUser(uid, profileOverride = null) {
  const profile = profileOverride || await getUserProfile(uid)
  if (!profile) throw new HttpsError('not-found', 'User profile not found.')
  const claims = buildClaimsFromProfile(profile)
  await adminAuth.setCustomUserClaims(uid, claims)
  await db.collection('users').doc(uid).set({
    claimsSyncedAt: FieldValue.serverTimestamp(),
    claimsSchemaVersion: claims.authzVersion,
    claimsAccessVersion: claims.accessVersion,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })
  return claims
}

export async function createOrUpdateUserProfile(uid, firebaseUser, input = {}, options = {}) {
  const now = FieldValue.serverTimestamp()
  const roleProfile = buildRoleProfile({
    role: options.role || 'user',
    roles: options.roles || [options.role || 'user'],
    directPermissionKeys: options.directPermissionKeys || [],
    deniedPermissionKeys: options.deniedPermissionKeys || [],
    mfaRequired: options.mfaRequired || false,
  })
  const safeProfile = pickProfileFields(stripAccessFields(input))
  const email = normalizeEmail(firebaseUser?.email || input.email || '')
  const payload = {
    uid,
    email,
    displayName: safeProfile.displayName || firebaseUser?.displayName || '',
    firstName: safeProfile.firstName || '',
    lastName: safeProfile.lastName || '',
    phoneNumber: safeProfile.phoneNumber || firebaseUser?.phoneNumber || '',
    photoURL: safeProfile.photoURL || firebaseUser?.photoURL || '',
    department: safeProfile.department || '',
    jobTitle: safeProfile.jobTitle || '',
    ...roleProfile,
    accessVersion: Date.now(),
    status: options.status || 'active',
    emailVerified: Boolean(firebaseUser?.emailVerified),
    mfaEnrolled: false,
    riskLevel: 'normal',
    inviteId: options.inviteId || null,
    termsAcceptedAt: safeProfile.termsAcceptedAt || null,
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  }

  await db.collection('users').doc(uid).set(payload, { merge: true })
  const snapshot = await db.collection('users').doc(uid).get()
  const profile = { id: snapshot.id, uid: snapshot.id, ...snapshot.data() }
  const claims = await syncClaimsForUser(uid, profile)
  return { profile, claims }
}

export async function findInviteByToken(inviteToken) {
  const tokenHash = hashToken(inviteToken)
  const query = await db.collection('user_invites').where('tokenHash', '==', tokenHash).limit(1).get()
  if (query.empty) return null
  const doc = query.docs[0]
  return { id: doc.id, ...doc.data() }
}

export function assertInviteUsable(invite, email = '') {
  if (!invite) throw new HttpsError('not-found', 'Invitation was not found.')
  if (!['pending', 'accepting'].includes(String(invite.status || '').toLowerCase())) {
    throw new HttpsError('failed-precondition', 'Invitation is not pending.')
  }
  const expiresAt = invite.expiresAt?.toMillis ? invite.expiresAt.toMillis() : new Date(invite.expiresAt || 0).getTime()
  if (expiresAt && expiresAt < Date.now()) {
    throw new HttpsError('deadline-exceeded', 'Invitation has expired.')
  }
  const expectedEmail = normalizeEmail(invite.email)
  const actualEmail = normalizeEmail(email)
  if (expectedEmail && actualEmail && expectedEmail !== actualEmail) {
    throw new HttpsError('permission-denied', 'Invitation does not belong to this email address.')
  }
}

export async function reserveInvite(invite, email) {
  const inviteRef = db.collection('user_invites').doc(invite.id)
  await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(inviteRef)
    if (!snap.exists) throw new HttpsError('not-found', 'Invitation was not found.')
    const current = { id: snap.id, ...snap.data() }
    assertInviteUsable(current, email)
    if (String(current.status || '').toLowerCase() !== 'pending') {
      throw new HttpsError('failed-precondition', 'Invitation is already being accepted.')
    }
    transaction.set(inviteRef, {
      status: 'accepting',
      acceptingEmail: normalizeEmail(email),
      acceptingAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  })
  return { ...invite, status: 'accepting' }
}

export async function releaseInviteReservation(invite, reason = '') {
  if (!invite?.id) return
  await db.collection('user_invites').doc(invite.id).set({
    status: 'pending',
    reservationFailedAt: FieldValue.serverTimestamp(),
    reservationFailureReason: String(reason || '').slice(0, 250),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })
}

export async function acceptInvite(invite, uid, email) {
  await db.collection('user_invites').doc(invite.id).set({
    status: 'accepted',
    acceptedAt: FieldValue.serverTimestamp(),
    acceptedByUid: uid,
    acceptedEmail: normalizeEmail(email),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })
}

export async function createInviteDocument(actor, data = {}) {
  const email = normalizeEmail(data.email)
  if (!email) throw new HttpsError('invalid-argument', 'Invite email is required.')
  const role = normalizeRoleKey(data.role || 'user')
  const token = generateToken(32)
  const tokenHash = hashToken(token)
  const expiresAtMs = Number(data.expiresAtMs || Date.now() + 7 * 24 * 60 * 60 * 1000)
  const now = FieldValue.serverTimestamp()
  const roleProfile = buildRoleProfile({
    role,
    roles: normalizeRoleKeys(data.roles || [role]),
    directPermissionKeys: data.directPermissionKeys || [],
    deniedPermissionKeys: data.deniedPermissionKeys || [],
    mfaRequired: Boolean(data.requiresMfa),
  })
  const ref = db.collection('user_invites').doc()
  const invite = {
    email,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    displayName: data.displayName || '',
    department: data.department || '',
    jobTitle: data.jobTitle || '',
    ...roleProfile,
    maxRoleLevel: data.maxRoleLevel || null,
    requiresMfa: roleProfile.mfaRequired,
    requiresApproval: Boolean(data.requiresApproval),
    status: 'pending',
    tokenHash,
    inviteUrl: data.baseUrl ? `${String(data.baseUrl).replace(/\/$/, '')}/register?invite=${token}` : '',
    note: data.note || '',
    policySnapshot: data.policySnapshot || {},
    expiresAt: new Date(expiresAtMs),
    invitedBy: actor.uid,
    invitedByName: actor.displayName || actor.email || '',
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  }
  await ref.set(invite)
  return { id: ref.id, token, inviteUrl: invite.inviteUrl, email, role }
}

export async function getFirebaseUserRecord(uid) {
  try {
    return await adminAuth.getUser(uid)
  } catch (error) {
    if (error?.code === 'auth/user-not-found') return null
    throw error
  }
}

export async function requireFreshActorForPrivilegedAction(request, actor) {
  // Firebase Auth exposes auth_time in seconds. Enforce recent login for privileged callable functions.
  const authTime = Number(request?.auth?.token?.auth_time || 0) * 1000
  const maxAgeMs = 15 * 60 * 1000
  if (!authTime || Date.now() - authTime > maxAgeMs) {
    throw new HttpsError('failed-precondition', 'Recent authentication is required for this privileged action.')
  }

  // Keep this enforceable without making the initial bootstrap account unusable.
  // Turn on ENFORCE_PRIVILEGED_MFA=true after Firebase MFA enrollment is wired in the app.
  if (process.env.ENFORCE_PRIVILEGED_MFA === 'true' && actor.mfaRequired && !request?.auth?.token?.firebase?.sign_in_second_factor) {
    throw new HttpsError('failed-precondition', 'MFA is required for this privileged action.')
  }
}

export function userSafeResult(uid, claims = {}) {
  return {
    uid,
    claims,
    refreshRequired: true,
  }
}

export const REQUIRED = AUTH_PERMISSIONS
