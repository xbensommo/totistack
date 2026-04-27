#!/usr/bin/env node
/**
 * @file functions/scripts/seed-sys-admin.mjs
 * @description One-time bootstrap seed for the first sysadmin user.
 *
 * Usage:
 *   cd functions
 *   SYS_ADMIN_EMAIL="owner@example.com" \
 *   SYS_ADMIN_PASSWORD="replace-with-strong-password" \
 *   SYS_ADMIN_DISPLAY_NAME="System Administrator" \
 *   npm run seed:sys-admin
 *
 * Requirements:
 * - GOOGLE_APPLICATION_CREDENTIALS points to a service-account JSON file, OR
 * - Application Default Credentials are configured in the runtime.
 *
 * Security rule:
 * - Do not run this from frontend code.
 * - Do not commit real passwords or service-account files.
 */

import { adminAuth, db, FieldValue } from '../src/firebase-admin.js'
import {
  ALL_AUTH_PERMISSION_VALUES,
  AUTH_ROLE_LEVELS,
  AUTH_ROLE_TEMPLATES,
  buildClaimsFromProfile,
  buildRoleProfile,
} from '../src/auth/authz.js'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function optionalEnv(name, fallback = '') {
  return process.env[name] || fallback
}

async function ensureAuthUser({ uid, email, password, displayName }) {
  try {
    const existing = await adminAuth.getUserByEmail(email)
    const updates = { displayName, disabled: false }
    if (password) updates.password = password
    await adminAuth.updateUser(existing.uid, updates)
    return existing.uid
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') throw error
    const created = await adminAuth.createUser({
      uid: uid || undefined,
      email,
      password,
      displayName,
      emailVerified: optionalEnv('SYS_ADMIN_EMAIL_VERIFIED', 'true') !== 'false',
      disabled: false,
    })
    return created.uid
  }
}

async function seedRoles() {
  const batch = db.batch()
  for (const [code, permissions] of Object.entries(AUTH_ROLE_TEMPLATES)) {
    const ref = db.collection('roles').doc(code)
    batch.set(ref, {
      code,
      name: code.split('-').map((item) => item[0].toUpperCase() + item.slice(1)).join(' '),
      description: `Built-in ${code} role.`,
      permissions,
      inheritedRoles: [],
      level: AUTH_ROLE_LEVELS[code] || 0,
      isSystem: true,
      immutable: ['sysadmin', 'security-admin', 'admin'].includes(code),
      requiresMfa: ['sysadmin', 'security-admin', 'admin'].includes(code),
      assignmentPolicy: {
        serverActionOnly: true,
        requiresFreshLogin: true,
        requiresAudit: true,
      },
      separationOfDuties: [],
      ownerDepartment: 'security',
      status: 'active',
      updatedBy: 'bootstrap',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isDeleted: false,
    }, { merge: true })
  }
  await batch.commit()
}

async function seedSecurityPolicy() {
  await db.collection('security_policies').doc('auth.default').set({
    code: 'auth.default',
    name: 'Default Auth Security Policy',
    version: '1.0.0',
    status: 'active',
    effectiveAt: FieldValue.serverTimestamp(),
    retiredAt: null,
    allowPublicSignup: optionalEnv('AUTH_ALLOW_PUBLIC_SIGNUP', 'false') === 'true',
    inviteOnly: optionalEnv('AUTH_INVITE_ONLY', 'true') !== 'false',
    defaultSignupRole: optionalEnv('AUTH_DEFAULT_SIGNUP_ROLE', 'user'),
    mfaRequiredForRoles: ['admin', 'security-admin', 'sysadmin'],
    allowedEmailDomains: optionalEnv('AUTH_ALLOWED_EMAIL_DOMAINS', '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
    sessionTtlMinutes: Number(optionalEnv('AUTH_SESSION_TTL_MINUTES', '480')),
    accessReviewCadenceDays: Number(optionalEnv('AUTH_ACCESS_REVIEW_CADENCE_DAYS', '90')),
    privilegedAccessRequiresApproval: optionalEnv('AUTH_PRIVILEGED_ACCESS_REQUIRES_APPROVAL', 'true') !== 'false',
    settings: {
      serverActionsRequired: true,
      customClaimsRequired: true,
      directClientRoleWritesAllowed: false,
      auditEvidenceWriter: 'cloud-functions',
    },
    approvedBy: 'bootstrap',
    approvedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    isDeleted: false,
  }, { merge: true })
}

async function seedSysAdmin() {
  const email = requireEnv('SYS_ADMIN_EMAIL').trim().toLowerCase()
  const password = requireEnv('SYS_ADMIN_PASSWORD')
  const displayName = optionalEnv('SYS_ADMIN_DISPLAY_NAME', 'System Administrator')
  const uid = optionalEnv('SYS_ADMIN_UID', '')
  const actualUid = await ensureAuthUser({ uid, email, password, displayName })
  const roleProfile = buildRoleProfile({ role: 'sysadmin', roles: ['sysadmin'], mfaRequired: true })
  const profile = {
    uid: actualUid,
    email,
    displayName,
    firstName: optionalEnv('SYS_ADMIN_FIRST_NAME', ''),
    lastName: optionalEnv('SYS_ADMIN_LAST_NAME', ''),
    phoneNumber: optionalEnv('SYS_ADMIN_PHONE', ''),
    photoURL: '',
    ...roleProfile,
    permissions: ALL_AUTH_PERMISSION_VALUES,
    permissionKeys: ALL_AUTH_PERMISSION_VALUES,
    directPermissionKeys: [],
    deniedPermissionKeys: [],
    accessVersion: Date.now(),
    status: 'active',
    emailVerified: optionalEnv('SYS_ADMIN_EMAIL_VERIFIED', 'true') !== 'false',
    mfaEnrolled: false,
    mfaRequired: true,
    riskLevel: 'high',
    employeeCode: optionalEnv('SYS_ADMIN_EMPLOYEE_CODE', 'SYS-0001'),
    department: 'security',
    jobTitle: optionalEnv('SYS_ADMIN_JOB_TITLE', 'System Administrator'),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    joinedAt: FieldValue.serverTimestamp(),
    lastAccessChangedAt: FieldValue.serverTimestamp(),
    lastAccessChangedBy: 'bootstrap',
    isDeleted: false,
    securityMetadata: {
      bootstrap: true,
      source: 'functions/scripts/seed-sys-admin.mjs',
    },
  }

  await db.collection('users').doc(actualUid).set(profile, { merge: true })
  const claims = buildClaimsFromProfile(profile)
  await adminAuth.setCustomUserClaims(actualUid, claims)
  await db.collection('users').doc(actualUid).set({
    claimsSyncedAt: FieldValue.serverTimestamp(),
    claimsSchemaVersion: claims.authzVersion,
    claimsAccessVersion: claims.accessVersion,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })

  await db.collection('auditLogs').add({
    actorId: actualUid,
    actorEmail: email,
    actorRoles: ['sysadmin'],
    actionId: 'auth.bootstrap.sysadmin_seeded',
    category: 'security',
    controlId: 'CC6.1',
    entityType: 'users',
    entityId: actualUid,
    source: 'seed-script',
    status: 'success',
    severity: 'critical',
    policyDecision: 'bootstrap-only',
    reason: 'Initial sysadmin account seeded from trusted server environment.',
    after: { role: 'sysadmin', email },
    retentionClass: 'security-7y',
    reviewStatus: 'unreviewed',
    meta: { serverActionsRequired: true },
    createdAt: FieldValue.serverTimestamp(),
    isDeleted: false,
  })

  return { uid: actualUid, email, claims }
}

await seedRoles()
await seedSecurityPolicy()
const result = await seedSysAdmin()
console.log(JSON.stringify({ ok: true, uid: result.uid, email: result.email, claimsVersion: result.claims.authzVersion }, null, 2))
