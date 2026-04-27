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
} from 'firebase/auth';

import { buildAuthRoleProfile } from './create-auth-role-profile.js';

const AUTH_ERROR_MESSAGES = {
  'auth/user-not-found': 'No account was found for that email address.',
  'auth/wrong-password': 'The password is incorrect.',
  'auth/invalid-credential': 'The provided credentials are invalid.',
  'auth/email-already-in-use': 'That email address is already in use.',
  'auth/weak-password': 'Password is too weak.',
  'auth/popup-closed-by-user': 'The sign-in popup was closed before completion.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup.',
  'auth/too-many-requests': 'Too many attempts were made. Please try again later.',
};

function normalizeError(error) {
  const message = AUTH_ERROR_MESSAGES[error?.code] || error?.message || 'Authentication failed.';
  const normalized = new Error(message);
  normalized.code = error?.code || 'auth/unknown';
  return normalized;
}

function createProvider(providerName) {
  switch ((providerName || '').toLowerCase()) {
    case 'google':
      return new GoogleAuthProvider();
    case 'github':
      return new GithubAuthProvider();
    case 'facebook':
      return new FacebookAuthProvider();
    case 'microsoft':
      return new OAuthProvider('microsoft.com');
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
}

function buildClaims(roles = []) {
  return roles.reduce((claims, role) => {
    claims[role] = true;
    return claims;
  }, {});
}

function isNotFoundError(error) {
  const code = String(error?.code || '').toUpperCase();
  const message = String(error?.message || '').toLowerCase();

  return code === 'NOT_FOUND' || code === 'AUTH/USER-NOT-FOUND' || message.includes('not found');
}

/**
 * Build the merged profile shape used by auth state sync.
 * This is read-only and must not write to persistence.
 *
 * @param {object} firebaseUser
 * @param {object|null} existing
 * @param {object} [profileData={}]
 * @param {object} [config={}]
 * @returns {object}
 */
function buildProfileSnapshot(firebaseUser, existing, profileData = {}, config = {}) {
  const roleProfile = buildAuthRoleProfile({ existing, profileData, config });

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: profileData.displayName || firebaseUser.displayName || existing?.displayName || '',
    firstName: profileData.firstName || existing?.firstName || '',
    lastName: profileData.lastName || existing?.lastName || '',
    photoURL: firebaseUser.photoURL || existing?.photoURL || '',
    phoneNumber: profileData.phoneNumber || existing?.phoneNumber || '',
    role: roleProfile.role,
    roles: roleProfile.roles,
    permissions: roleProfile.permissions,
    status: existing?.status || profileData.status || 'active',
    emailVerified: firebaseUser.emailVerified,
    createdAt: existing?.createdAt || profileData.createdAt || null,
    lastLoginAt: existing?.lastLoginAt || profileData.lastLoginAt || null,
  };
}

export function createAuthAccessService({
  auth,
  state,
  shardProvider,
  collectionActions,
  config,
  accessControl,
  storeApi,
}) {
  const userCollectionName = config?.profileCollection || 'users';
  const actionKey = `${userCollectionName}Actions`;
  const resolvedCollectionActions = storeApi?.[actionKey] || collectionActions?.[actionKey] || null;

  if (!resolvedCollectionActions) {
    throw new Error(
      `[auth] Missing generated collection actions for "${userCollectionName}". The auth runtime must use the root store collection registry.`
    );
  }

  const usersActions = resolvedCollectionActions;
  let initialized = false;
  let initializePromise = null;

  async function getExistingProfile(firebaseUser) {
    try {
      return await usersActions.getById(firebaseUser.uid);
    } catch (error) {
      if (isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Read and merge a user profile for state sync.
   * This function must stay read-only.
   *
   * @param {object} firebaseUser
   * @param {object} [profileData={}]
   * @returns {Promise<object>}
   */
  async function ensureUserProfile(firebaseUser, profileData = {}) {
    const existing = await getExistingProfile(firebaseUser);
    return buildProfileSnapshot(firebaseUser, existing, profileData, config);
  }

  /**
   * Create the profile once when it does not exist.
   * This is reserved for explicit creation paths like sign up and first social login.
   *
   * @param {object} firebaseUser
   * @param {object} [profileData={}]
   * @returns {Promise<object>}
   */
  async function createUserProfileIfMissing(firebaseUser, profileData = {}) {
    let existing;

    try{
      existing = await getExistingProfile(firebaseUser);
    }catch(error){
      
    }
    if (existing) {
      return buildProfileSnapshot(firebaseUser, existing, profileData, config);
    }

    const timestamp = new Date();
    const nextProfile = buildProfileSnapshot(firebaseUser, null, {
      ...profileData,
      createdAt: timestamp,
      lastLoginAt: timestamp,
    }, config);

    await usersActions.setById(firebaseUser.uid, nextProfile);
    return nextProfile;
  }

  async function syncAuthenticatedUser(firebaseUser) {
    if (!firebaseUser) {
      storeApi.clearAccessState();
      return null;
    }

    const cached = state._profileCache.value;
    const cacheAge = Date.now() - (cached?.timestamp || 0);
    if (cached?.uid === firebaseUser.uid && cacheAge < (config?.cacheTtlMs || 0) && cached?.data) {
      storeApi.syncAccessState(cached.data);
      return cached.data;
    }

    const profile = await ensureUserProfile(firebaseUser);
    const accessContext = accessControl?.resolveAccessContext
      ? await accessControl.resolveAccessContext({ firebaseUser, profile })
      : {
          roles: Array.isArray(profile.roles) ? profile.roles : [profile.role || 'user'],
          permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
          claims: buildClaims(Array.isArray(profile.roles) ? profile.roles : [profile.role || 'user']),
        };

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
    };

    state._profileCache.value = {
      uid: firebaseUser.uid,
      timestamp: Date.now(),
      data: userData,
    };

    storeApi.syncAccessState(userData);
    return userData;
  }

  async function initialize() {
    if (initializePromise) {
      return initializePromise;
    }

    state.authStatus.value = 'syncing';
    initializePromise = new Promise((resolve) => {
      state._sessionStart.value = Date.now();
      state._authUnsubscribe.value = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            await syncAuthenticatedUser(firebaseUser);
          } else {
            storeApi.clearAccessState();
          }
        } catch (error) {
          storeApi.setError(normalizeError(error));
        } finally {
          initialized = true;
          storeApi.setAuthInitialized(true);
          resolve(firebaseUser);
        }
      });
    });

    return initializePromise;
  }

  async function login(email, password) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return syncAuthenticatedUser(credential.user);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function signUp(email, password, profileData = {}) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      if (profileData.displayName) {
        await updateFirebaseProfile(credential.user, {
          displayName: profileData.displayName,
        });
      }

      await createUserProfileIfMissing(credential.user, profileData);
      await sendEmailVerification(credential.user).catch(() => undefined);
      return syncAuthenticatedUser(credential.user);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      state._profileCache.value = { uid: null, timestamp: 0, data: null };
      storeApi.clearAccessState();
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function resetPassword(code, newPassword) {
    try {
      await confirmPasswordReset(auth, code, newPassword);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function updateProfile(profileData = {}) {
    try {
      if (!auth.currentUser) {
        throw new Error('No active session.');
      }

      if (profileData.displayName) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: profileData.displayName,
        });
      }

      await usersActions.update(auth.currentUser.uid, {
        ...profileData,
      });

      state._profileCache.value = { uid: null, timestamp: 0, data: null };
      return syncAuthenticatedUser(auth.currentUser);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      if (!auth.currentUser?.email) {
        throw new Error('An active session is required to change password.');
      }

      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function loginWithSocial(providerName) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = createProvider(providerName);
      const result = await signInWithPopup(auth, provider);
      await createUserProfileIfMissing(result.user, {
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
      });
      return syncAuthenticatedUser(result.user);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function resendVerificationEmail() {
    try {
      if (!auth.currentUser) {
        throw new Error('No active session.');
      }
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function refreshUserClaims() {
    if (!auth.currentUser) {
      return {};
    }

    const user = await syncAuthenticatedUser(auth.currentUser);
    return user?.claims || {};
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
    get initialized() {
      return initialized;
    },
  };
}

export default createAuthAccessService;
