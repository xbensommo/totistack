/**
 * @file src/features/auth/index.js
 */

import authGuard from './guards/authGuard.js';
import guestGuard from './guards/guestGuard.js';
import authRoutes from './routes/index.js';
import authService from './services/authService.js';
import userService from './services/userService.js';
import authStore from './stores/authStore.js';
import userStore from './stores/userStore.js';

export async function initialize(context = {}, config = {}) {
  if (!context.router) {
    throw new Error('Auth feature requires router context');
  }

  if (context.store) {
    if (!context.store.hasModule('auth')) {
      context.store.registerModule('auth', authStore);
    }
    if (!context.store.hasModule('user')) {
      context.store.registerModule('user', userStore);
    }
  }

  userService.initialize(context, config);
  await authService.initialize(config);

  if (Array.isArray(authRoutes)) {
    for (const route of authRoutes) {
      context.router.addRoute(route);
    }
  }

  const unsubscribe = authService.onAuthStateChange(async (user) => {
    if (context.store) {
      context.store.dispatch('auth/setUser', user);
    }

    if (user && config.syncUserProfile !== false && userService.isAvailable()) {
      const profile = await userService.upsertProfile(user).catch((error) => {
        console.error('[Auth Feature] Failed to sync user profile:', error);
        return null;
      });
      if (profile && context.store) {
        context.store.dispatch('user/setProfile', profile);
      }
    }

    if (!user && context.store) {
      context.store.dispatch('user/reset');
    }

    context.eventBus?.emit?.('auth:state-change', user);
  });

  return {
    authService,
    userService,
    authGuard,
    guestGuard,
    authStore,
    userStore,
    dispose() {
      unsubscribe?.();
    },
  };
}

export { authService, userService, authGuard, guestGuard, authStore, userStore };
export default { initialize };

import { defineFeatureContract } from '../../core/contracts/feature.contract.js';
import { defineAsyncComponent } from 'vue';
import { createShardedActions } from '@xbensommo/shard-provider';
import { useToast } from 'vue-sonner';
import routes from './routes';
import authStore from './stores/auth-store';
import { AuthService } from './services/auth-service';

/**
 * Authentication feature.
 */
export default defineFeatureContract({
  id: 'auth',
  name: 'auth',
  collections: ["users", "sessions"],
  dependencies: [],
  apps: [],
  meta: {
    installable: true
  }
});


/**
 * Auth Module Entry Point
 * @module auth
 * @description Authentication module for Totistack v2 with Firebase integration
 */

/**
 * Install the auth module into the application
 * @param {Object} app - Vue application instance
 * @param {Object} config - Module configuration
 * @param {Object} config.firebase - Firebase configuration
 * @param {Object} config.routes - Additional routes to merge
 * @returns {Object} Module API
 */
export async function install(app, config = {}) {
  const { firebase, ...moduleConfig } = config;
  
  // Validate Firebase is available
  if (!firebase) {
    throw new Error('Firebase configuration is required for auth module');
  }
  
  // Initialize auth service
  const authService = new AuthService(firebase);
  
  // Create and register auth store
  const store = authStore(authService);
  app.use(store);
  
  // Make auth service available globally
  app.provide('authService', authService);
  app.provide('authStore', store);
  
  // Register async components
  app.component('AuthGuard', defineAsyncComponent(() => import('./components/auth-guard.vue')));
  app.component('SocialAuthButtons', defineAsyncComponent(() => import('./components/social-auth-buttons.vue')));
  
  // Register auth layout
  const AuthLayout = defineAsyncComponent(() => import('./layouts/auth-layout.vue'));
  app.component('AuthLayout', AuthLayout);
  
  // Return module API
  return {
    service: authService,
    store,
    hooks: {
      useAuth: () => import('./hooks/use-auth').then(m => m.useAuth()),
      useAuthGuard: () => import('./hooks/use-auth').then(m => m.useAuthGuard())
    }
  };
}

/**
 * Initialize the module with context
 * @param {Object} context - Application context
 * @param {Object} context.router - Vue Router instance
 * @param {Object} context.store - Pinia store
 * @param {Function} context.getModule - Get module by ID
 * @param {Function} context.getService - Get service by name
 * @returns {Promise<void>}
 */
export async function init(context) {
  const { router, store, getModule, getService } = context;
  
  // Get auth store from Pinia
  const authStore = store.auth;
  
  if (!authStore) {
    throw new Error('Auth store not found');
  }
  
  // Add routes to router
  routes.forEach(route => {
    router.addRoute(route);
  });
  
  // Set up global auth guard
  router.beforeEach(async (to, from, next) => {
    const isAuthenticated = authStore.isAuthenticated;
    const user = authStore.user;
    
    // Check if route requires authentication
    if (to.meta.requiresAuth && !isAuthenticated) {
      next({ name: 'auth.login', query: { redirect: to.fullPath } });
      return;
    }
    
    // Check if route is for guests only (login/register pages)
    if (to.meta.guest && isAuthenticated) {
      next({ name: to.meta.redirectAfterLogin || 'home' });
      return;
    }
    
    // Check permissions if RBAC module is available
    if (to.meta.permissions && to.meta.permissions.length > 0 && user) {
      const rbacModule = getModule('rbac');
      if (rbacModule && rbacModule.hasPermissions) {
        const hasPermission = await rbacModule.hasPermissions(user.uid, to.meta.permissions);
        if (!hasPermission) {
          const toast = useToast();
          toast.error('You don\'t have permission to access this page');
          next({ name: 'home' });
          return;
        }
      }
    }
    
    next();
  });
  
  // Initialize auth state
  await authStore.initAuthListener();
  
  console.log('Auth module initialized');
}
