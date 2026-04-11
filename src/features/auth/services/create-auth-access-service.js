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
import { createShardedActions } from '@xbensommo/shard-provider';

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
  const usersActions = collectionActions(userCollectionName) || createShardedActions(userCollectionName, state, shardProvider);
  let initialized = false;
  let initializePromise = null;

  async function ensureUserProfile(firebaseUser, profileData = {}) {
    const existing = await usersActions.getById(firebaseUser.uid).catch(() => null);

    const nextProfile = {
      email: firebaseUser.email,
      displayName: profileData.displayName || firebaseUser.displayName || existing?.displayName || '',
      firstName: profileData.firstName || existing?.firstName || '',
      lastName: profileData.lastName || existing?.lastName || '',
      photoURL: firebaseUser.photoURL || existing?.photoURL || '',
      phoneNumber: profileData.phoneNumber || existing?.phoneNumber || '',
      role: existing?.role || config?.rbac?.defaultRole || 'user',
      roles: Array.isArray(existing?.roles) && existing.roles.length > 0 ? existing.roles : [existing?.role || config?.rbac?.defaultRole || 'user'],
      permissions: Array.isArray(existing?.permissions) ? existing.permissions : [],
      status: existing?.status || 'active',
      emailVerified: firebaseUser.emailVerified,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
      createdAt: existing?.createdAt || new Date(),
    };

    if (existing) {
      await usersActions.update(firebaseUser.uid, nextProfile);
      return { ...existing, ...nextProfile };
    }

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

      await ensureUserProfile(credential.user, profileData);
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
        updatedAt: new Date(),
      });

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
      await ensureUserProfile(result.user, {
        displayName: result.user.displayName || '',
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
    get initialized() {
      return initialized;
    },
  };
}

export default createAuthAccessService;
