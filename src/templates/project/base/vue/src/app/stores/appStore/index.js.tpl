/**
 * @file app/stores/appStore/index.js
 * @description Root application store.
 *
 * Rules:
 * - Auth and RBAC belong here because they are platform-level concerns.
 * - Collection actions are generated from the build-time collection registry.
 * - Apps and features stay declarative and do not assemble the root store.
 */

import { computed } from 'vue';
import { defineStore } from 'pinia';
import { auth, functions } from '@app/firebase/index.js';
import shardProvider from '@app/provider/shard-provider.js';
import useAppStoreState from './state.js';
import { createRootCollectionRegistry } from './collection-actions.js';
import accessConfig from '@config/access.config.js';
import { getGeneratedServiceBySuffix } from '@generated/services.js';

/**
 * Resolve a factory function from a generated service export.
 *
 * @param {unknown} candidate
 * @param {string} exportName
 * @returns {Function|null}
 */
function resolveFactory(candidate, exportName) {
  if (typeof candidate === 'function') {
    return candidate;
  }

  if (candidate && typeof candidate === 'object' && typeof candidate[exportName] === 'function') {
    return candidate[exportName];
  }

  return null;
}

export const useAppStore = defineStore('appStore', () => {
  const state = useAppStoreState();
  const collectionRegistry = createRootCollectionRegistry(state);
  const collectionsActions = collectionRegistry.byName;
  const legacyCollectionActions = collectionRegistry.legacy;

  let accessRuntime = null;
  let accessControl = null;
  let accessRuntimeInitialized = false;
  let accessReadyResolve = () => {};
  let accessReadyPromise = new Promise((resolve) => {
    accessReadyResolve = resolve;
  });

  const isAuthenticated = computed(() => Boolean(state.currentUser.value));
  const isAccessControlEnabled = computed(() => Boolean(accessConfig?.rbac?.enabled));

  /**
   * Lookup collection actions by collection name.
   *
   * @param {string} collectionName
   * @returns {any|null}
   */
  const getCollectionActions = (collectionName) => collectionRegistry.get(collectionName);

  /**
   * Lookup collection actions by collection name and throw when missing.
   *
   * @param {string} collectionName
   * @returns {any}
   */
  const requireCollectionActions = (collectionName) => collectionRegistry.require(collectionName);

  /**
   * Lookup the canonical state bucket for a collection.
   *
   * @param {string} collectionName
   * @returns {any|null}
   */
  const getCollectionState = (collectionName) => collectionRegistry.getState(collectionName);

  /**
   * Set the authenticated user and normalize access fields.
   *
   * @param {Record<string, any>|null} user
   * @returns {void}
   */
  const setCurrentUser = (user) => {
    state.currentUser.value = user;
    state.roles.value = Array.isArray(user?.roles)
      ? user.roles
      : user?.role
        ? [user.role]
        : [];
    state.permissions.value = Array.isArray(user?.permissions) ? user.permissions : [];
    state.claims.value = user?.claims && typeof user.claims === 'object' ? user.claims : {};
  };

  /**
   * Mark auth bootstrapping as complete.
   *
   * @param {boolean} value
   * @returns {void}
   */
  const setAuthInitialized = (value = true) => {
    state.authInitialized.value = Boolean(value);
    state.authStatus.value = value ? 'ready' : 'pending';
  };

  /**
   * Replace the current permission list.
   *
   * @param {string[]} permissions
   * @returns {void}
   */
  const setPermissions = (permissions = []) => {
    state.permissions.value = Array.isArray(permissions) ? permissions : [];
  };

  /**
   * Replace the current role list.
   *
   * @param {string[]} roles
   * @returns {void}
   */
  const setRoles = (roles = []) => {
    state.roles.value = Array.isArray(roles) ? roles : [];
  };

  /**
   * Replace the current claims map.
   *
   * @param {Record<string, boolean>} claims
   * @returns {void}
   */
  const setClaims = (claims = {}) => {
    state.claims.value = claims && typeof claims === 'object' ? claims : {};
  };

  /**
   * Sync all access state from one payload.
   *
   * @param {Record<string, any>|null} payload
   * @returns {void}
   */
  const syncAccessState = (payload) => {
    setCurrentUser(payload || null);
  };

  /**
   * Check whether the current user has a given role.
   *
   * @param {string} role
   * @returns {boolean}
   */
  const hasRole = (role) => state.roles.value.includes(role);

  /**
   * Check whether the current user has any of the supplied roles.
   *
   * @param {string[]} roles
   * @returns {boolean}
   */
  const hasAnyRole = (roles = []) => roles.some((role) => hasRole(role));

  /**
   * Check whether the current user has a specific permission.
   *
   * @param {string} permission
   * @returns {boolean}
   */
  const hasPermission = (permission) => state.permissions.value.includes(permission);

  /**
   * Router adapter helper.
   *
   * @param {string[]|undefined} requiredRoles
   * @param {string|undefined} routeName
   * @returns {boolean}
   */
  const checkPermission = (requiredRoles = [], routeName = undefined) => {
    void routeName;

    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return true;
    }

    if (!isAccessControlEnabled.value) {
      return true;
    }

    return hasAnyRole(requiredRoles) || requiredRoles.some((role) => hasPermission(role));
  };

  /**
   * Check role and permission constraints from route meta.
   *
   * @param {Record<string, any>} routeMeta
   * @returns {boolean}
   */
  const canAccessRoute = (routeMeta = {}) => {
    if (!routeMeta || typeof routeMeta !== 'object') {
      return true;
    }

    if (!isAccessControlEnabled.value) {
      return true;
    }

    const requiredRoles = Array.isArray(routeMeta.roles) ? routeMeta.roles : [];
    const requiredPermissions = Array.isArray(routeMeta.permissions) ? routeMeta.permissions : [];

    const roleAllowed = requiredRoles.length === 0 || hasAnyRole(requiredRoles);
    const permissionAllowed = requiredPermissions.length === 0 || requiredPermissions.every((permission) => hasPermission(permission));

    return roleAllowed && permissionAllowed;
  };

  /**
   * Lightweight refresh hook used by router guards.
   *
   * @returns {Promise<Record<string, boolean>>}
   */
  const refreshUserClaims = async () => {
    if (accessRuntime?.refreshUserClaims) {
      return accessRuntime.refreshUserClaims();
    }
    return state.claims.value;
  };

  /**
   * Reset auth and access state.
   *
   * @returns {void}
   */
  const clearAccessState = () => {
    state.currentUser.value = null;
    state.roles.value = [];
    state.permissions.value = [];
    state.claims.value = {};
  };

  /**
   * Show the global loading indicator.
   *
   * @returns {void}
   */
  const showLoading = () => {
    state.loading.value = true;
    state.isLoading.value = true;
  };

  /**
   * Hide the global loading indicator.
   *
   * @returns {void}
   */
  const hideLoading = () => {
    state.loading.value = false;
    state.isLoading.value = false;
  };

  /**
   * Set the root store error value.
   *
   * @param {unknown} error
   * @returns {void}
   */
  const setError = (error) => {
    state.error.value = error;
  };

  /**
   * Wait until the auth bootstrap sequence has completed.
   *
   * @returns {Promise<void>}
   */
  const waitForAccessReady = async () => {
    await accessReadyPromise;
  };

  /**
   * Initialise auth and RBAC runtime services if those features are installed.
   *
   * @returns {Promise<void>}
   */
  const initAccessRuntime = async () => {
    if (accessRuntimeInitialized) {
      return;
    }

    if (import.meta.env.SSR) {
      accessRuntimeInitialized = true;
      setAuthInitialized(true);
      accessReadyResolve();
      return;
    }

    accessRuntimeInitialized = true;
    state.accessRuntimeEnabled.value = Boolean(accessConfig?.enabled);
    state.rbacEnabled.value = Boolean(accessConfig?.rbac?.enabled);
    state.authStatus.value = 'booting';
    showLoading();

    try {
      const authFactoryCandidate = getGeneratedServiceBySuffix('create-auth-access-service');
      const accessFactoryCandidate = getGeneratedServiceBySuffix('create-access-control-service');
      const serverActionsFactoryCandidate = getGeneratedServiceBySuffix('create-auth-server-actions');

      const createAccessControlService = resolveFactory(accessFactoryCandidate, 'createAccessControlService');
      const createAuthAccessService = resolveFactory(authFactoryCandidate, 'createAuthAccessService');
      const createAuthServerActions = resolveFactory(serverActionsFactoryCandidate, 'createAuthServerActions');
      const authServerActions = typeof createAuthServerActions === 'function'
        ? createAuthServerActions({ functions })
        : null;

      if (typeof createAccessControlService === 'function') {
        accessControl = createAccessControlService({
          auth,
          state,
          shardProvider,
          collectionActions: getCollectionActions,
          config: accessConfig,
        });
      }

      if (typeof createAuthAccessService === 'function' && accessConfig?.enabled) {
        accessRuntime = createAuthAccessService({
          auth,
          state,
          shardProvider,
          collectionActions: getCollectionActions,
          config: accessConfig,
          accessControl,
          serverActions: authServerActions,
          storeApi: {
            syncAccessState,
            clearAccessState,
            setCurrentUser,
            setRoles,
            setPermissions,
            setClaims,
            setError,
            setAuthInitialized,
          },
        });

        await accessRuntime.initialize();
        accessReadyResolve();
      } else {
        setAuthInitialized(true);
        accessReadyResolve();
      }
    } catch (error) {
      setError(error);
      setAuthInitialized(true);
      accessReadyResolve();
      throw error;
    } finally {
      hideLoading();
      state.authStatus.value = 'ready';
    }
  };

  /**
   * Mark the runtime bootstrap promise as resolved.
   *
   * @returns {void}
   */
  const markAccessReady = () => {
    accessReadyResolve();
  };

  /**
   * Delegate login to the installed auth service.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<any>}
   */
  const login = async (email, password) => {
    await initAccessRuntime();
    if (!accessRuntime?.login) throw new Error('Auth feature is not installed.');
    return accessRuntime.login(email, password);
  };

  /**
   * Delegate registration to the installed auth service.
   *
   * @param {string} email
   * @param {string} password
   * @param {Record<string, any>} profileData
   * @returns {Promise<any>}
   */
  const signUp = async (email, password, profileData = {}) => {
    await initAccessRuntime();
    if (!accessRuntime?.signUp) throw new Error('Auth feature is not installed.');
    return accessRuntime.signUp(email, password, profileData);
  };

  /**
   * Delegate logout to the installed auth service.
   *
   * @returns {Promise<void>}
   */
  const logout = async () => {
    await initAccessRuntime();
    if (!accessRuntime?.logout) throw new Error('Auth feature is not installed.');
    return accessRuntime.logout();
  };

  /**
   * Send a password reset email.
   *
   * @param {string} email
   * @returns {Promise<void>}
   */
  const sendPasswordReset = async (email) => {
    await initAccessRuntime();
    if (!accessRuntime?.sendPasswordReset) throw new Error('Auth feature is not installed.');
    return accessRuntime.sendPasswordReset(email);
  };

  /**
   * Confirm a password reset flow.
   *
   * @param {string} code
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  const resetPassword = async (code, newPassword) => {
    await initAccessRuntime();
    if (!accessRuntime?.resetPassword) throw new Error('Auth feature is not installed.');
    return accessRuntime.resetPassword(code, newPassword);
  };

  /**
   * Update the authenticated user's profile.
   *
   * @param {Record<string, any>} profileData
   * @returns {Promise<any>}
   */
  const updateProfile = async (profileData = {}) => {
    await initAccessRuntime();
    if (!accessRuntime?.updateProfile) throw new Error('Auth feature is not installed.');
    return accessRuntime.updateProfile(profileData);
  };

  /**
   * Change the authenticated user's password.
   *
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  const changePassword = async (currentPassword, newPassword) => {
    await initAccessRuntime();
    if (!accessRuntime?.changePassword) throw new Error('Auth feature is not installed.');
    return accessRuntime.changePassword(currentPassword, newPassword);
  };

  /**
   * Start an OAuth sign-in flow.
   *
   * @param {string} providerName
   * @returns {Promise<any>}
   */
  const loginWithSocial = async (providerName) => {
    await initAccessRuntime();
    if (!accessRuntime?.loginWithSocial) throw new Error('Auth feature is not installed.');
    return accessRuntime.loginWithSocial(providerName);
  };

  /**
   * Send a verification email.
   *
   * @returns {Promise<void>}
   */
  const resendVerificationEmail = async () => {
    await initAccessRuntime();
    if (!accessRuntime?.resendVerificationEmail) throw new Error('Auth feature is not installed.');
    return accessRuntime.resendVerificationEmail();
  };

  return {
    ...state,
    collectionsActions,
    getCollectionActions,
    requireCollectionActions,
    getCollectionState,
    ...legacyCollectionActions,
    isAuthenticated,
    isAccessControlEnabled,
    setCurrentUser,
    setAuthInitialized,
    setPermissions,
    setRoles,
    setClaims,
    syncAccessState,
    hasRole,
    hasAnyRole,
    hasPermission,
    checkPermission,
    canAccessRoute,
    refreshUserClaims,
    clearAccessState,
    showLoading,
    hideLoading,
    setError,
    waitForAccessReady,
    initAccessRuntime,
    markAccessReady,
    login,
    signUp,
    logout,
    sendPasswordReset,
    resetPassword,
    updateProfile,
    changePassword,
    loginWithSocial,
    resendVerificationEmail,
  };
});
