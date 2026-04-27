import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth'

import { useAppStore } from '@app/stores/appStore'

import { AUTH_PERMISSIONS, canAssignRole } from '../permissions.js'
import { assertAccess, buildAccessContext } from './access-control.service.js'
import { buildAuthRoleProfile, stripAccessFields } from './create-auth-role-profile.js'

const AUTH_ERROR_MESSAGES = {
  'auth/user-not-found': 'No account was found for that email address.',
  'auth/wrong-password': 'The password is incorrect.',
  'auth/invalid-credential': 'The provided credentials are invalid.',
  'auth/email-already-in-use': 'That email address is already in use.',
  'auth/weak-password': 'Password is too weak.',
  'auth/popup-closed-by-user': 'The sign-in popup was closed before completion.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup.',
  'auth/too-many-requests': 'Too many attempts were made. Please try again later.',
}

const PROFILE_WRITE_ALLOWLIST = Object.freeze([
  'displayName',
  'firstName',
  'lastName',
  'phoneNumber',
  'photoURL',
  'termsAcceptedAt',
])

function normalizeError(error) {
  const message = AUTH_ERROR_MESSAGES[error?.code] || error?.message || 'Authentication failed.'
  const normalized = new Error(message)
  normalized.code = error?.code || 'auth/unknown'
  normalized.decision = error?.decision || null
  return normalized
}

function createProvider(providerName) {
  switch ((providerName || '').toLowerCase()) {
    case 'google': return new GoogleAuthProvider()
    case 'github': return new GithubAuthProvider()
    case 'facebook': return new FacebookAuthProvider()
    case 'microsoft': return new OAuthProvider('microsoft.com')
    default: throw new Error(`Unsupported provider: ${providerName}`)
  }
}

function isNotFoundError(error) {
  const code = String(error?.code || '').toUpperCase()
  const message = String(error?.message || '').toLowerCase()
  return code === 'NOT_FOUND' || code === 'AUTH/USER-NOT-FOUND' || message.includes('not found')
}

function pickAllowed(payload = {}, allowlist = PROFILE_WRITE_ALLOWLIST) {
  return allowlist.reduce((next, key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) next[key] = payload[key]
    return next
  }, {})
}

function auditEvent(store, payload) {
  if (typeof store?.recordSecurityEvent === 'function') return store.recordSecurityEvent(payload)
  if (typeof store?.auditLogsActions?.add === 'function') {
    return store.auditLogsActions.add({
      ...payload,
      source: payload.source || 'auth-client',
      status: payload.status || 'attempted',
      severity: payload.severity || 'info',
      isDeleted: false,
    }).catch(() => undefined)
  }
  return Promise.resolve(undefined)
}

function buildProfileSnapshot(firebaseUser, existing, profileData = {}, config = {}, context = {}) {
  const roleProfile = buildAuthRoleProfile({ existing, profileData, config, context })
  const safeProfileData = stripAccessFields(profileData)

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: safeProfileData.displayName || firebaseUser.displayName || existing?.displayName || '',
    firstName: safeProfileData.firstName || existing?.firstName || '',
    lastName: safeProfileData.lastName || existing?.lastName || '',
    photoURL: firebaseUser.photoURL || existing?.photoURL || safeProfileData.photoURL || '',
    phoneNumber: safeProfileData.phoneNumber || existing?.phoneNumber || '',
    role: roleProfile.role,
    roles: roleProfile.roles,
    permissions: roleProfile.permissions,
    permissionKeys: roleProfile.permissionKeys,
    directPermissionKeys: roleProfile.directPermissionKeys,
    deniedPermissionKeys: roleProfile.deniedPermissionKeys,
    accessVersion: Number(existing?.accessVersion || 1),
    status: existing?.status || safeProfileData.status || 'active',
    emailVerified: Boolean(firebaseUser.emailVerified),
    mfaEnrolled: Boolean(existing?.mfaEnrolled || false),
    mfaRequired: Boolean(existing?.mfaRequired || false),
    riskLevel: existing?.riskLevel || 'normal',
    createdAt: existing?.createdAt || safeProfileData.createdAt || null,
    lastLoginAt: safeProfileData.lastLoginAt || existing?.lastLoginAt || null,
  }
}

export function createAuthAccessService({ auth, state, collectionActions, config = {}, accessControl, storeApi, serverActions } = {}) {
  const store = useAppStore()
  const userCollectionName = config?.profileCollection || 'users'
  const actionKey = `${userCollectionName}Actions`
  const usersActions = store?.[actionKey] || collectionActions?.[actionKey] || null

  if (!auth) throw new Error('[auth] Firebase Auth instance is required.')
  if (!usersActions) {
    throw new Error(`[auth] Missing generated collection actions for "${userCollectionName}".`)
  }

  let initialized = false
  let initializePromise = null
  let currentAccess = null

  function getSignupMode() {
    return String(config?.signupMode || config?.registrationMode || (config?.inviteOnly ? 'invite-only' : 'public')).toLowerCase()
  }

  function canUseClientProfileWrites() {
    return config?.allowClientProfileWrites === true && config?.allowUnsafeClientProfileWrites === true
  }

  async function refreshFirebaseIdToken(force = true) {
    if (auth.currentUser && typeof auth.currentUser.getIdToken === 'function') {
      await auth.currentUser.getIdToken(force)
    }
  }

  async function getExistingProfile(firebaseUser) {
    try {
      return await usersActions.getById(firebaseUser.uid)
    } catch (error) {
      if (isNotFoundError(error)) return null
      throw error
    }
  }

  async function ensureUserProfile(firebaseUser, profileData = {}) {
    const existing = await getExistingProfile(firebaseUser)
    return buildProfileSnapshot(firebaseUser, existing, profileData, config)
  }

  async function createUserProfileIfMissing(firebaseUser, profileData = {}, context = {}) {
    const existing = await getExistingProfile(firebaseUser)
    if (existing) return buildProfileSnapshot(firebaseUser, existing, profileData, config)

    const safeProfileData = pickAllowed(stripAccessFields(profileData))

    if (typeof serverActions?.completeSignup === 'function') {
      await serverActions.completeSignup({
        profileData: safeProfileData,
        inviteToken: context.inviteToken || profileData.inviteToken || profileData.token || '',
      })
      await refreshFirebaseIdToken(true)
      const created = await getExistingProfile(firebaseUser)
      if (created) return buildProfileSnapshot(firebaseUser, created, {}, config)
    }

    if (!canUseClientProfileWrites()) {
      const error = new Error('Server actions are required to create authorization profiles. Refusing unsafe client-side profile write.')
      error.code = 'auth/server-actions-required'
      throw error
    }

    const timestamp = new Date()
    const nextProfile = buildProfileSnapshot(firebaseUser, null, {
      ...safeProfileData,
      createdAt: timestamp,
      joinedAt: timestamp,
      lastLoginAt: timestamp,
      status: 'active',
    }, config, context)

    await usersActions.setById(firebaseUser.uid, nextProfile)
    await auditEvent(store, {
      actorId: firebaseUser.uid,
      actorEmail: firebaseUser.email,
      actionId: 'auth.user.profile.created',
      entityType: 'users',
      entityId: firebaseUser.uid,
      reason: 'Profile created during authentication using legacy client profile writes.',
      source: 'auth-client',
      status: 'success',
      severity: 'warning',
      meta: { ignoredAccessFields: buildAuthRoleProfile({ profileData, config }).ignoredAccessFields },
    })
    return nextProfile
  }

  async function syncAuthenticatedUser(firebaseUser) {
    if (!firebaseUser) {
      currentAccess = null
      storeApi.clearAccessState()
      return null
    }

    const cached = state._profileCache.value
    const cacheAge = Date.now() - (cached?.timestamp || 0)
    if (cached?.uid === firebaseUser.uid && cacheAge < (config?.cacheTtlMs || 0) && cached?.data) {
      currentAccess = cached.data
      storeApi.syncAccessState(cached.data)
      return cached.data
    }

    const profile = await ensureUserProfile(firebaseUser)
    if (String(profile.status || 'active').toLowerCase() !== 'active') {
      await signOut(auth)
      const error = new Error('Your account is not active.')
      error.code = 'auth/account-not-active'
      throw error
    }

    const accessContext = accessControl?.resolveAccessContext
      ? await accessControl.resolveAccessContext({ firebaseUser, profile })
      : buildAccessContext({ firebaseUser, profile, config })

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      displayName: profile.displayName || firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || profile.photoURL || '',
      ...profile,
      roles: accessContext.roles,
      permissions: accessContext.permissions,
      claims: accessContext.claims,
      accessVersion: accessContext.accessVersion,
    }

    state._profileCache.value = { uid: firebaseUser.uid, timestamp: Date.now(), data: userData }
    currentAccess = userData
    storeApi.syncAccessState(userData)
    return userData
  }

  async function initialize() {
    if (initializePromise) return initializePromise
    state.authStatus.value = 'syncing'
    initializePromise = new Promise((resolve) => {
      state._sessionStart.value = Date.now()
      state._authUnsubscribe.value = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) await syncAuthenticatedUser(firebaseUser)
          else {
            currentAccess = null
            storeApi.clearAccessState()
          }
        } catch (error) {
          storeApi.setError(normalizeError(error))
        } finally {
          initialized = true
          storeApi.setAuthInitialized(true)
          resolve(firebaseUser)
        }
      })
    })
    return initializePromise
  }

  async function login(email, password) {
    try {
      await setPersistence(auth, browserLocalPersistence)
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const user = await syncAuthenticatedUser(credential.user)
      await auditEvent(store, {
        actorId: credential.user.uid,
        actorEmail: credential.user.email,
        actionId: 'auth.login.success',
        entityType: 'users',
        entityId: credential.user.uid,
        source: 'firebase-auth',
        status: 'success',
        severity: 'info',
      })
      return user
    } catch (error) {
      await auditEvent(store, {
        actorEmail: email,
        actionId: 'auth.login.failure',
        source: 'firebase-auth',
        status: 'failure',
        severity: 'warning',
        errorCode: error?.code || 'auth/login-failed',
        errorMessage: error?.message || 'Login failed.',
      })
      throw normalizeError(error)
    }
  }

  async function signUp(email, password, profileData = {}) {
    try {
      const mode = getSignupMode()
      const inviteToken = profileData?.inviteToken || profileData?.token || ''
      const safeProfileData = pickAllowed(stripAccessFields(profileData))

      if (mode === 'disabled') {
        const error = new Error('Signup is disabled by system policy.')
        error.code = 'auth/signup-disabled'
        throw error
      }

      await setPersistence(auth, browserLocalPersistence)

      if (mode === 'invite-only') {
        if (!inviteToken) {
          const error = new Error('A valid invitation is required.')
          error.code = 'auth/invite-required'
          throw error
        }
        if (typeof serverActions?.createUserByInvite !== 'function') {
          const error = new Error('Invite-only signup requires createUserByInvite server action.')
          error.code = 'auth/server-actions-required'
          throw error
        }
        await serverActions.createUserByInvite({ email, password, inviteToken, profileData: safeProfileData })
        const credential = await signInWithEmailAndPassword(auth, email, password)
        await refreshFirebaseIdToken(true)
        return syncAuthenticatedUser(credential.user)
      }

      if (inviteToken && typeof serverActions?.createUserByInvite === 'function') {
        await serverActions.createUserByInvite({ email, password, inviteToken, profileData: safeProfileData })
        const credential = await signInWithEmailAndPassword(auth, email, password)
        await refreshFirebaseIdToken(true)
        return syncAuthenticatedUser(credential.user)
      }

      if (typeof serverActions?.createUserBySignup === 'function') {
        await serverActions.createUserBySignup({ email, password, profileData: safeProfileData })
        const credential = await signInWithEmailAndPassword(auth, email, password)
        await sendEmailVerification(credential.user).catch(() => undefined)
        await refreshFirebaseIdToken(true)
        return syncAuthenticatedUser(credential.user)
      }

      if (!canUseClientProfileWrites()) {
        const error = new Error('Public signup requires createUserBySignup server action.')
        error.code = 'auth/server-actions-required'
        throw error
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password)

      if (safeProfileData.displayName) {
        await updateFirebaseProfile(credential.user, { displayName: safeProfileData.displayName })
      }

      await createUserProfileIfMissing(credential.user, safeProfileData)
      await sendEmailVerification(credential.user).catch(() => undefined)
      await refreshFirebaseIdToken(true)
      return syncAuthenticatedUser(credential.user)
    } catch (error) {
      throw normalizeError(error)
    }
  }

  async function logout() {
    try {
      const actor = currentAccess
      await signOut(auth)
      state._profileCache.value = { uid: null, timestamp: 0, data: null }
      currentAccess = null
      storeApi.clearAccessState()
      if (actor?.uid) {
        await auditEvent(store, {
          actorId: actor.uid,
          actorEmail: actor.email,
          actionId: 'auth.logout',
          entityType: 'users',
          entityId: actor.uid,
          source: 'firebase-auth',
          status: 'success',
          severity: 'info',
        })
      }
    } catch (error) {
      throw normalizeError(error)
    }
  }

  async function sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email)
      await auditEvent(store, {
        actorEmail: email,
        actionId: 'auth.password_reset.requested',
        source: 'firebase-auth',
        status: 'success',
        severity: 'info',
      })
    } catch (error) {
      throw normalizeError(error)
    }
  }

  async function resetPassword(code, newPassword) {
    try {
      await confirmPasswordReset(auth, code, newPassword)
    } catch (error) {
      throw normalizeError(error)
    }
  }

  async function updateProfile(profileData = {}) {
    try {
      if (!auth.currentUser) throw new Error('No active session.')
      assertAccess({ actor: currentAccess, permissions: [AUTH_PERMISSIONS.PROFILE_UPDATE_OWN], config })

      const safeProfileData = pickAllowed(stripAccessFields(profileData))
      if (safeProfileData.displayName) {
        await updateFirebaseProfile(auth.currentUser, { displayName: safeProfileData.displayName })
      }

      await usersActions.update(auth.currentUser.uid, safeProfileData)
      state._profileCache.value = { uid: null, timestamp: 0, data: null }
      return syncAuthenticatedUser(auth.currentUser)
    } catch (error) {
      throw normalizeError(error)
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      if (!auth.currentUser?.email) throw new Error('An active session is required to change password.')
      assertAccess({ actor: currentAccess, permissions: [AUTH_PERMISSIONS.PROFILE_SECURITY_UPDATE_OWN], config })

      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPassword)
      await refreshFirebaseIdToken(true)
      await auditEvent(store, {
        actorId: auth.currentUser.uid,
        actorEmail: auth.currentUser.email,
        actionId: 'auth.password.changed',
        entityType: 'users',
        entityId: auth.currentUser.uid,
        source: 'firebase-auth',
        status: 'success',
        severity: 'info',
      })
    } catch (error) {
      throw normalizeError(error)
    }
  }

  async function loginWithSocial(providerName) {
    try {
      await setPersistence(auth, browserLocalPersistence)
      const provider = createProvider(providerName)
      const result = await signInWithPopup(auth, provider)
      await createUserProfileIfMissing(result.user, {
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
      })
      return syncAuthenticatedUser(result.user)
    } catch (error) {
      throw normalizeError(error)
    }
  }

  async function resendVerificationEmail() {
    try {
      if (!auth.currentUser) throw new Error('No active session.')
      await sendEmailVerification(auth.currentUser)
    } catch (error) {
      throw normalizeError(error)
    }
  }

  async function refreshUserClaims() {
    if (!auth.currentUser) return {}
    if (typeof serverActions?.syncCurrentUserClaims === 'function') {
      await serverActions.syncCurrentUserClaims()
      await refreshFirebaseIdToken(true)
    }
    const user = await syncAuthenticatedUser(auth.currentUser)
    return user?.claims || {}
  }

  async function updateUserRole(userId, nextRole, options = {}) {
    assertAccess({ actor: currentAccess, permissions: [AUTH_PERMISSIONS.ROLE_ASSIGN], targetRole: nextRole, config })
    if (!canAssignRole(currentAccess, nextRole, config?.rbac || {})) {
      const error = new Error('ROLE_ASSIGNMENT_FORBIDDEN')
      error.code = 'ROLE_ASSIGNMENT_FORBIDDEN'
      throw error
    }

    if (typeof serverActions?.assignUserRole === 'function') {
      const result = await serverActions.assignUserRole(userId, nextRole, options)
      if (auth.currentUser?.uid === userId) await refreshFirebaseIdToken(true)
      return result
    }

    if (!canUseClientProfileWrites()) {
      const error = new Error('Role changes require assignUserRole server action.')
      error.code = 'auth/server-actions-required'
      throw error
    }

    const nextAccessVersion = Number(options.accessVersion || Date.now())
    const payload = {
      role: nextRole,
      roles: [nextRole],
      permissionKeys: [],
      permissions: [],
      directPermissionKeys: [],
      deniedPermissionKeys: [],
      accessVersion: nextAccessVersion,
      lastAccessChangedAt: new Date(),
      lastAccessChangedBy: currentAccess?.uid || null,
    }
    await usersActions.update(userId, payload)
    await auditEvent(store, {
      actorId: currentAccess?.uid,
      actorEmail: currentAccess?.email,
      actionId: 'auth.user.role_changed.legacy_client_write',
      entityType: 'users',
      entityId: userId,
      source: 'auth-service',
      status: 'success',
      severity: 'critical',
      after: { role: nextRole },
    })
    return payload
  }

  async function suspendUser(userId, reason = '') {
    assertAccess({ actor: currentAccess, permissions: [AUTH_PERMISSIONS.SUSPEND_USER], config })

    if (typeof serverActions?.suspendUser === 'function') {
      const result = await serverActions.suspendUser(userId, reason)
      if (auth.currentUser?.uid === userId) await refreshFirebaseIdToken(true)
      return result
    }

    if (!canUseClientProfileWrites()) {
      const error = new Error('Suspension requires suspendUser server action.')
      error.code = 'auth/server-actions-required'
      throw error
    }

    const payload = {
      status: 'suspended',
      suspendedAt: new Date(),
      suspendedBy: currentAccess?.uid || null,
      suspensionReason: reason || 'Suspended by administrator.',
      accessVersion: Date.now(),
    }
    await usersActions.update(userId, payload)
    await auditEvent(store, {
      actorId: currentAccess?.uid,
      actorEmail: currentAccess?.email,
      actionId: 'auth.user.suspended.legacy_client_write',
      entityType: 'users',
      entityId: userId,
      source: 'auth-service',
      status: 'success',
      severity: 'critical',
      reason: payload.suspensionReason,
    })
    return payload
  }

  async function grantUserPermission(userId, permissions = [], options = {}) {
    assertAccess({ actor: currentAccess, permissions: [AUTH_PERMISSIONS.PERMISSION_GRANT], config })
    if (typeof serverActions?.grantUserPermission !== 'function') {
      const error = new Error('Permission grants require grantUserPermission server action.')
      error.code = 'auth/server-actions-required'
      throw error
    }
    return serverActions.grantUserPermission(userId, permissions, options)
  }

  async function denyUserPermission(userId, permissions = [], options = {}) {
    assertAccess({ actor: currentAccess, permissions: [AUTH_PERMISSIONS.PERMISSION_DENY], config })
    if (typeof serverActions?.denyUserPermission !== 'function') {
      const error = new Error('Permission denials require denyUserPermission server action.')
      error.code = 'auth/server-actions-required'
      throw error
    }
    return serverActions.denyUserPermission(userId, permissions, options)
  }

  async function restoreUser(userId, reason = '') {
    assertAccess({ actor: currentAccess, permissions: [AUTH_PERMISSIONS.USER_RESTORE], config })
    if (typeof serverActions?.restoreUser !== 'function') {
      const error = new Error('User restore requires restoreUser server action.')
      error.code = 'auth/server-actions-required'
      throw error
    }
    return serverActions.restoreUser(userId, reason)
  }

  async function revokeUserSessions(userId, reason = '') {
    assertAccess({ actor: currentAccess, permissions: [AUTH_PERMISSIONS.SESSION_REVOKE], config })
    if (typeof serverActions?.revokeUserSessions !== 'function') {
      const error = new Error('Session revocation requires revokeUserSessions server action.')
      error.code = 'auth/server-actions-required'
      throw error
    }
    return serverActions.revokeUserSessions(userId, reason)
  }

  return {
    initialize,
    login,
    signUp,
    logout,
    sendPasswordReset,
    resetPassword,
    updateProfile,
    changePassword,
    loginWithSocial,
    resendVerificationEmail,
    refreshUserClaims,
    syncAuthenticatedUser,
    ensureUserProfile,
    createUserProfileIfMissing,
    updateUserRole,
    suspendUser,
    restoreUser,
    grantUserPermission,
    denyUserPermission,
    revokeUserSessions,
    getCurrentUser: () => currentAccess,
    getCurrentAccess: () => currentAccess,
    get initialized() { return initialized },
    get currentUser() { return currentAccess },
    get currentAccess() { return currentAccess },
  }
}

export default createAuthAccessService
