/**
 * @file functions/src/index.js
 * @description Totistack auth/audit trusted backend control plane.
 *
 * These callable functions own privileged access changes, custom claims, invite onboarding,
 * session revocation, and authoritative audit evidence. The browser may request a change;
 * it may not directly write privileged security fields.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'
import { adminAuth, db, FieldValue } from './firebase-admin.js'
import {
  AUTH_PERMISSIONS,
  assertCanAssignRole,
  buildRoleProfile,
  normalizePermissionKeys,
  normalizeRoleKey,
  normalizeRoleKeys,
  stripAccessFields,
} from './auth/authz.js'
import {
  acceptInvite,
  assertAuthenticated,
  assertEmailAllowed,
  assertInviteUsable,
  createInviteDocument,
  createOrUpdateUserProfile,
  findInviteByToken,
  getActiveSecurityPolicy,
  getFirebaseUserRecord,
  getUserProfile,
  normalizeEmail,
  requireActor,
  requireFreshActorForPrivilegedAction,
  reserveInvite,
  releaseInviteReservation,
  syncClaimsForUser,
  toHttpsError,
  userSafeResult,
  writeAuditEvent,
} from './auth/security-utils.js'

const runtimeOptions = {
  region: process.env.FUNCTIONS_REGION || 'us-central1',
  enforceAppCheck: process.env.ENFORCE_APP_CHECK === 'true',
  cors: true,
}

function callable(handler) {
  return onCall(runtimeOptions, async (request) => {
    try {
      return await handler(request)
    } catch (error) {
      logger.warn('Auth control-plane function failed.', {
        code: error?.code,
        message: error?.message,
      })
      throw toHttpsError(error)
    }
  })
}

/**
 * Completes profile creation for Firebase Auth users created by public signup or accepted invites.
 * Public signup is allowed only when the active security policy permits it.
 */
export const completeSignup = callable(async (request) => {
  const auth = assertAuthenticated(request)
  const policy = await getActiveSecurityPolicy()
  const data = request.data || {}
  const firebaseUser = await adminAuth.getUser(auth.uid)
  const email = normalizeEmail(firebaseUser.email || data.email)
  assertEmailAllowed(email, policy)

  const inviteToken = data.inviteToken || data.token || ''
  let role = policy.defaultSignupRole || 'user'
  let roles = [role]
  let invite = null

  if (inviteToken) {
    invite = await findInviteByToken(inviteToken)
    assertInviteUsable(invite, email)
    invite = await reserveInvite(invite, email)
    role = normalizeRoleKey(invite.role || 'user')
    roles = normalizeRoleKeys(invite.roles || [role])
  } else if (policy.inviteOnly || policy.allowPublicSignup !== true) {
    throw new HttpsError('permission-denied', 'Public signup is disabled. A valid invitation is required.')
  }

  const result = await createOrUpdateUserProfile(auth.uid, firebaseUser, data.profileData || {}, {
    role,
    roles,
    directPermissionKeys: invite?.directPermissionKeys || [],
    deniedPermissionKeys: invite?.deniedPermissionKeys || [],
    mfaRequired: invite?.requiresMfa || (policy.mfaRequiredForRoles || []).some((item) => roles.includes(item)),
    inviteId: invite?.id || null,
  })

  if (invite) await acceptInvite(invite, auth.uid, email)

  await writeAuditEvent({
    actorId: auth.uid,
    actorEmail: email,
    actorRoles: result.profile.roles,
    actionId: invite ? 'auth.invite.accepted' : 'auth.signup.completed',
    controlId: 'CC6.2',
    entityType: 'users',
    entityId: auth.uid,
    status: 'success',
    severity: 'info',
    policyDecision: invite ? 'invite-accepted' : 'public-signup-allowed',
    after: { role: result.profile.role, roles: result.profile.roles, inviteId: invite?.id || null },
  })

  return userSafeResult(auth.uid, result.claims)
})

/**
 * Creates a Firebase Auth user through the active public-signup policy.
 * This prevents orphan Auth users when backend policy denies signup.
 */
export const createUserBySignup = callable(async (request) => {
  const data = request.data || {}
  const email = normalizeEmail(data.email)
  const password = String(data.password || "")
  if (!email || !password) throw new HttpsError("invalid-argument", "email and password are required.")

  const policy = await getActiveSecurityPolicy()
  if (policy.inviteOnly || policy.allowPublicSignup !== true) {
    throw new HttpsError("permission-denied", "Public signup is disabled. A valid invitation is required.")
  }
  assertEmailAllowed(email, policy)

  let firebaseUser = null
  try {
    firebaseUser = await adminAuth.createUser({
      email,
      password,
      displayName: data.profileData?.displayName || "",
      disabled: false,
      emailVerified: false,
    })
  } catch (error) {
    if (error?.code === "auth/email-already-exists") {
      firebaseUser = await adminAuth.getUserByEmail(email)
      const existingProfile = await getUserProfile(firebaseUser.uid)
      if (existingProfile) throw new HttpsError("already-exists", "A user profile already exists for this email.")
    } else {
      throw error
    }
  }

  const role = normalizeRoleKey(policy.defaultSignupRole || "user")
  const roles = [role]
  const result = await createOrUpdateUserProfile(firebaseUser.uid, firebaseUser, data.profileData || {}, {
    role,
    roles,
    directPermissionKeys: [],
    deniedPermissionKeys: [],
    mfaRequired: (policy.mfaRequiredForRoles || []).some((item) => roles.includes(item)),
    inviteId: null,
  })

  await writeAuditEvent({
    actorId: firebaseUser.uid,
    actorEmail: email,
    actorRoles: result.profile.roles,
    actionId: "auth.user.created_by_public_signup",
    controlId: "CC6.2",
    entityType: "users",
    entityId: firebaseUser.uid,
    status: "success",
    severity: "info",
    policyDecision: "public-signup-created-user",
    after: { role: result.profile.role, roles: result.profile.roles },
  })

  return userSafeResult(firebaseUser.uid, result.claims)
})

/**
 * Creates a Firebase Auth user from a valid invitation and password.
 * Use for invite-only systems where the browser should not create authorization profiles directly.
 */
export const createUserByInvite = callable(async (request) => {
  const data = request.data || {}
  const email = normalizeEmail(data.email)
  const password = String(data.password || '')
  const inviteToken = data.inviteToken || data.token || ''
  if (!email || !password || !inviteToken) {
    throw new HttpsError('invalid-argument', 'email, password, and inviteToken are required.')
  }

  const policy = await getActiveSecurityPolicy()
  assertEmailAllowed(email, policy)

  let invite = await findInviteByToken(inviteToken)
  assertInviteUsable(invite, email)
  invite = await reserveInvite(invite, email)

  let firebaseUser = null
  try {
    firebaseUser = await adminAuth.createUser({
      email,
      password,
      displayName: data.profileData?.displayName || invite.displayName || '',
      disabled: false,
      emailVerified: false,
    })
  } catch (error) {
    if (error?.code === 'auth/email-already-exists') {
      firebaseUser = await adminAuth.getUserByEmail(email)
      const existingProfile = await getUserProfile(firebaseUser.uid)
      if (existingProfile) {
        await releaseInviteReservation(invite, 'user-profile-already-exists')
        throw new HttpsError('already-exists', 'A user profile already exists for this email.')
      }
    } else {
      await releaseInviteReservation(invite, error?.code || 'auth-create-user-failed')
      throw error
    }
  }

  const role = normalizeRoleKey(invite.role || 'user')
  const roles = normalizeRoleKeys(invite.roles || [role])
  const result = await createOrUpdateUserProfile(firebaseUser.uid, firebaseUser, {
    ...(data.profileData || {}),
    displayName: data.profileData?.displayName || invite.displayName || '',
    firstName: data.profileData?.firstName || invite.firstName || '',
    lastName: data.profileData?.lastName || invite.lastName || '',
    department: data.profileData?.department || invite.department || '',
    jobTitle: data.profileData?.jobTitle || invite.jobTitle || '',
  }, {
    role,
    roles,
    directPermissionKeys: invite.directPermissionKeys || [],
    deniedPermissionKeys: invite.deniedPermissionKeys || [],
    mfaRequired: Boolean(invite.requiresMfa),
    inviteId: invite.id,
  })

  await acceptInvite(invite, firebaseUser.uid, email)
  await writeAuditEvent({
    actorId: firebaseUser.uid,
    actorEmail: email,
    actorRoles: result.profile.roles,
    actionId: 'auth.user.created_by_invite',
    controlId: 'CC6.2',
    entityType: 'users',
    entityId: firebaseUser.uid,
    status: 'success',
    severity: 'info',
    policyDecision: 'invite-created-user',
    after: { role: result.profile.role, roles: result.profile.roles, inviteId: invite.id },
  })

  return userSafeResult(firebaseUser.uid, result.claims)
})

/** Creates an invitation. Only privileged users may create invites. */
export const createInvite = callable(async (request) => {
  const actor = await requireActor(request, AUTH_PERMISSIONS.INVITE_CREATE)
  await requireFreshActorForPrivilegedAction(request, actor)
  const data = request.data || {}
  const targetRole = normalizeRoleKey(data.role || 'user')
  assertCanAssignRole(actor, targetRole)

  const policy = await getActiveSecurityPolicy()
  assertEmailAllowed(data.email, policy)
  const invite = await createInviteDocument(actor, { ...data, policySnapshot: policy })

  await writeAuditEvent({
    actorId: actor.uid,
    actorEmail: actor.email,
    actorRoles: actor.roles || [actor.role],
    actionId: 'auth.invite.created',
    controlId: 'CC6.1',
    entityType: 'user_invites',
    entityId: invite.id,
    status: 'success',
    severity: 'info',
    after: { email: invite.email, role: invite.role },
  })

  return invite
})

/** Assigns a role and synchronizes Firebase custom claims. */
export const assignUserRole = callable(async (request) => {
  const actor = await requireActor(request, AUTH_PERMISSIONS.ROLE_ASSIGN)
  await requireFreshActorForPrivilegedAction(request, actor)
  const { uid, role, roles = null, reason = '' } = request.data || {}
  if (!uid || !role) throw new HttpsError('invalid-argument', 'uid and role are required.')
  const targetRole = normalizeRoleKey(role)
  assertCanAssignRole(actor, targetRole)

  const target = await getUserProfile(uid)
  if (!target) throw new HttpsError('not-found', 'Target user profile not found.')
  const normalizedRoles = normalizeRoleKeys(roles || [targetRole])
  for (const item of normalizedRoles) assertCanAssignRole(actor, item)

  const before = {
    role: target.role,
    roles: target.roles || [],
    permissions: target.permissions || [],
    directPermissionKeys: target.directPermissionKeys || [],
    deniedPermissionKeys: target.deniedPermissionKeys || [],
    accessVersion: target.accessVersion || 1,
  }
  const roleProfile = buildRoleProfile({
    role: targetRole,
    roles: normalizedRoles,
    deniedPermissionKeys: target.deniedPermissionKeys || [],
    directPermissionKeys: [],
  })
  const update = {
    ...roleProfile,
    accessVersion: Date.now(),
    lastAccessChangedAt: FieldValue.serverTimestamp(),
    lastAccessChangedBy: actor.uid,
    updatedAt: FieldValue.serverTimestamp(),
  }
  await db.collection('users').doc(uid).set(update, { merge: true })
  const updatedProfile = { ...target, ...update, uid, id: uid }
  const claims = await syncClaimsForUser(uid, updatedProfile)
  await adminAuth.revokeRefreshTokens(uid)

  await writeAuditEvent({
    actorId: actor.uid,
    actorEmail: actor.email,
    actorRoles: actor.roles || [actor.role],
    actionId: 'auth.user.role_assigned',
    controlId: 'CC6.1',
    entityType: 'users',
    entityId: uid,
    status: 'success',
    severity: 'warning',
    reason: reason || 'Role assignment through server control plane.',
    before,
    after: { role: targetRole, roles: normalizedRoles, accessVersion: update.accessVersion },
  })

  return userSafeResult(uid, claims)
})

/** Grants direct permissions to a user and synchronizes custom claims. */
export const grantUserPermission = callable(async (request) => {
  const actor = await requireActor(request, AUTH_PERMISSIONS.PERMISSION_GRANT)
  await requireFreshActorForPrivilegedAction(request, actor)
  const { uid, permissions = [], reason = '' } = request.data || {}
  if (!uid) throw new HttpsError('invalid-argument', 'uid is required.')
  const target = await getUserProfile(uid)
  if (!target) throw new HttpsError('not-found', 'Target user profile not found.')

  const nextDirect = [...new Set([...(target.directPermissionKeys || []), ...normalizePermissionKeys(permissions)])]
  const nextDenied = normalizePermissionKeys(target.deniedPermissionKeys || []).filter((item) => !nextDirect.includes(item))
  const update = {
    directPermissionKeys: nextDirect,
    deniedPermissionKeys: nextDenied,
    accessVersion: Date.now(),
    lastAccessChangedAt: FieldValue.serverTimestamp(),
    lastAccessChangedBy: actor.uid,
    updatedAt: FieldValue.serverTimestamp(),
  }
  await db.collection('users').doc(uid).set(update, { merge: true })
  const claims = await syncClaimsForUser(uid, { ...target, ...update })
  await adminAuth.revokeRefreshTokens(uid)

  await writeAuditEvent({
    actorId: actor.uid,
    actorEmail: actor.email,
    actorRoles: actor.roles || [actor.role],
    actionId: 'auth.user.permission_granted',
    controlId: 'CC6.1',
    entityType: 'users',
    entityId: uid,
    status: 'success',
    severity: 'warning',
    reason,
    before: { directPermissionKeys: target.directPermissionKeys || [], deniedPermissionKeys: target.deniedPermissionKeys || [] },
    after: { directPermissionKeys: nextDirect, deniedPermissionKeys: nextDenied },
  })

  return userSafeResult(uid, claims)
})

/** Explicitly denies permissions. Deny always overrides roles and grants. */
export const denyUserPermission = callable(async (request) => {
  const actor = await requireActor(request, AUTH_PERMISSIONS.PERMISSION_DENY)
  await requireFreshActorForPrivilegedAction(request, actor)
  const { uid, permissions = [], reason = '' } = request.data || {}
  if (!uid) throw new HttpsError('invalid-argument', 'uid is required.')
  const target = await getUserProfile(uid)
  if (!target) throw new HttpsError('not-found', 'Target user profile not found.')

  const denied = normalizePermissionKeys(permissions)
  const nextDenied = [...new Set([...(target.deniedPermissionKeys || []), ...denied])]
  const nextDirect = normalizePermissionKeys(target.directPermissionKeys || []).filter((item) => !nextDenied.includes(item))
  const update = {
    directPermissionKeys: nextDirect,
    deniedPermissionKeys: nextDenied,
    accessVersion: Date.now(),
    lastAccessChangedAt: FieldValue.serverTimestamp(),
    lastAccessChangedBy: actor.uid,
    updatedAt: FieldValue.serverTimestamp(),
  }
  await db.collection('users').doc(uid).set(update, { merge: true })
  const claims = await syncClaimsForUser(uid, { ...target, ...update })
  await adminAuth.revokeRefreshTokens(uid)

  await writeAuditEvent({
    actorId: actor.uid,
    actorEmail: actor.email,
    actorRoles: actor.roles || [actor.role],
    actionId: 'auth.user.permission_denied',
    controlId: 'CC6.1',
    entityType: 'users',
    entityId: uid,
    status: 'success',
    severity: 'warning',
    reason,
    before: { directPermissionKeys: target.directPermissionKeys || [], deniedPermissionKeys: target.deniedPermissionKeys || [] },
    after: { directPermissionKeys: nextDirect, deniedPermissionKeys: nextDenied },
  })

  return userSafeResult(uid, claims)
})

/** Suspends a user, revokes refresh tokens, and updates claims. */
export const suspendUser = callable(async (request) => {
  const actor = await requireActor(request, AUTH_PERMISSIONS.SUSPEND_USER)
  await requireFreshActorForPrivilegedAction(request, actor)
  const { uid, reason = 'Suspended by administrator.' } = request.data || {}
  if (!uid) throw new HttpsError('invalid-argument', 'uid is required.')
  const target = await getUserProfile(uid)
  if (!target) throw new HttpsError('not-found', 'Target user profile not found.')

  const update = {
    status: 'suspended',
    suspendedAt: FieldValue.serverTimestamp(),
    suspendedBy: actor.uid,
    suspensionReason: reason,
    accessVersion: Date.now(),
    updatedAt: FieldValue.serverTimestamp(),
  }
  await db.collection('users').doc(uid).set(update, { merge: true })
  const claims = await syncClaimsForUser(uid, { ...target, ...update, status: 'suspended' })
  await adminAuth.updateUser(uid, { disabled: true })
  await adminAuth.revokeRefreshTokens(uid)

  await writeAuditEvent({
    actorId: actor.uid,
    actorEmail: actor.email,
    actorRoles: actor.roles || [actor.role],
    actionId: 'auth.user.suspended',
    controlId: 'CC6.3',
    entityType: 'users',
    entityId: uid,
    status: 'success',
    severity: 'critical',
    reason,
    before: { status: target.status || 'active' },
    after: { status: 'suspended' },
  })

  return userSafeResult(uid, claims)
})

/** Restores a suspended user. */
export const restoreUser = callable(async (request) => {
  const actor = await requireActor(request, AUTH_PERMISSIONS.USER_RESTORE)
  await requireFreshActorForPrivilegedAction(request, actor)
  const { uid, reason = 'Restored by administrator.' } = request.data || {}
  if (!uid) throw new HttpsError('invalid-argument', 'uid is required.')
  const target = await getUserProfile(uid)
  if (!target) throw new HttpsError('not-found', 'Target user profile not found.')

  const update = {
    status: 'active',
    restoredAt: FieldValue.serverTimestamp(),
    restoredBy: actor.uid,
    suspensionReason: '',
    accessVersion: Date.now(),
    updatedAt: FieldValue.serverTimestamp(),
  }
  await db.collection('users').doc(uid).set(update, { merge: true })
  const claims = await syncClaimsForUser(uid, { ...target, ...update, status: 'active' })
  await adminAuth.updateUser(uid, { disabled: false })
  await adminAuth.revokeRefreshTokens(uid)

  await writeAuditEvent({
    actorId: actor.uid,
    actorEmail: actor.email,
    actorRoles: actor.roles || [actor.role],
    actionId: 'auth.user.restored',
    controlId: 'CC6.3',
    entityType: 'users',
    entityId: uid,
    status: 'success',
    severity: 'warning',
    reason,
    before: { status: target.status || 'suspended' },
    after: { status: 'active' },
  })

  return userSafeResult(uid, claims)
})

/** Revokes Firebase refresh tokens and marks server session evidence revoked. */
export const revokeUserSessions = callable(async (request) => {
  const actor = await requireActor(request, AUTH_PERMISSIONS.SESSION_REVOKE)
  await requireFreshActorForPrivilegedAction(request, actor)
  const { uid, reason = 'Session revoked by administrator.' } = request.data || {}
  if (!uid) throw new HttpsError('invalid-argument', 'uid is required.')

  const user = await getFirebaseUserRecord(uid)
  if (!user) throw new HttpsError('not-found', 'Firebase Auth user not found.')
  await adminAuth.revokeRefreshTokens(uid)
  await db.collection('users').doc(uid).set({
    accessVersion: Date.now(),
    sessionsRevokedAt: FieldValue.serverTimestamp(),
    sessionsRevokedBy: actor.uid,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })

  const openSessions = await db.collection('sessions').where('userId', '==', uid).where('status', '==', 'active').limit(200).get()
  const batch = db.batch()
  for (const doc of openSessions.docs) {
    batch.set(doc.ref, {
      status: 'revoked',
      isActive: false,
      revokedAt: FieldValue.serverTimestamp(),
      revokedBy: actor.uid,
      revokeReason: reason,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }
  if (!openSessions.empty) await batch.commit()
  const claims = await syncClaimsForUser(uid)

  await writeAuditEvent({
    actorId: actor.uid,
    actorEmail: actor.email,
    actorRoles: actor.roles || [actor.role],
    actionId: 'auth.sessions.revoked',
    controlId: 'CC6.8',
    entityType: 'users',
    entityId: uid,
    status: 'success',
    severity: 'warning',
    reason,
    result: { revokedSessionDocuments: openSessions.size },
  })

  return userSafeResult(uid, claims)
})

/** Rebuilds and writes Firebase custom claims for a target user. */
export const syncUserClaims = callable(async (request) => {
  const actor = await requireActor(request, AUTH_PERMISSIONS.USER_UPDATE)
  await requireFreshActorForPrivilegedAction(request, actor)
  const { uid } = request.data || {}
  if (!uid) throw new HttpsError('invalid-argument', 'uid is required.')
  const claims = await syncClaimsForUser(uid)
  await adminAuth.revokeRefreshTokens(uid)
  await writeAuditEvent({
    actorId: actor.uid,
    actorEmail: actor.email,
    actorRoles: actor.roles || [actor.role],
    actionId: 'auth.claims.synced',
    controlId: 'CC6.1',
    entityType: 'users',
    entityId: uid,
    status: 'success',
    severity: 'info',
    result: { accessVersion: claims.accessVersion, authzVersion: claims.authzVersion },
  })
  return userSafeResult(uid, claims)
})

/** Allows the signed-in user to refresh their token after backend access changes. */
export const syncCurrentUserClaims = callable(async (request) => {
  const auth = assertAuthenticated(request)
  const claims = await syncClaimsForUser(auth.uid)
  await writeAuditEvent({
    actorId: auth.uid,
    actorEmail: request.auth?.token?.email || null,
    actorRoles: claims.roles || [],
    actionId: 'auth.claims.self_synced',
    controlId: 'CC6.1',
    entityType: 'users',
    entityId: auth.uid,
    status: 'success',
    severity: 'info',
  })
  return userSafeResult(auth.uid, claims)
})

/** Records server-side audit evidence for approved backend integrations. */
export const recordAuditEvent = callable(async (request) => {
  const actor = await requireActor(request, AUTH_PERMISSIONS.AUDIT_MANAGE)
  await requireFreshActorForPrivilegedAction(request, actor)
  const safe = stripAccessFields(request.data || {})
  const result = await writeAuditEvent({
    ...safe,
    actorId: actor.uid,
    actorEmail: actor.email,
    actorRoles: actor.roles || [actor.role],
    source: 'cloud-functions',
  })
  return result
})
