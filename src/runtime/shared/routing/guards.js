/**
 * @file guards.js
 * @description Route guards for authentication and authorization.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { useAuthStore } from '../../stores/auth.store.js';

/**
 * Authentication guard - redirects to login if not authenticated.
 * @param {Object} to - Target route
 * @param {Object} from - Current route
 * @param {Function} next - Navigation function
 */
export function requireAuth(to, from, next) {
  const authStore = useAuthStore();
  
  if (authStore.isAuthenticated) {
    next();
  } else {
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    });
  }
}

/**
 * Guest guard - redirects to home if already authenticated.
 * @param {Object} to - Target route
 * @param {Object} from - Current route
 * @param {Function} next - Navigation function
 */
export function requireGuest(to, from, next) {
  const authStore = useAuthStore();
  
  if (!authStore.isAuthenticated) {
    next();
  } else {
    next({ name: 'home' });
  }
}

/**
 * Permission guard - checks if user has required permissions.
 * @param {Array|string} permissions - Required permissions
 * @returns {Function} Guard function
 */
export function requirePermissions(permissions) {
  const required = Array.isArray(permissions) ? permissions : [permissions];
  
  return (to, from, next) => {
    const authStore = useAuthStore();
    
    if (!authStore.user) {
      next({ name: 'login' });
      return;
    }
    
    const hasPermission = required.every(perm => 
      authStore.user.permissions?.includes(perm)
    );
    
    if (hasPermission) {
      next();
    } else {
      next({ name: 'unauthorized' });
    }
  };
}

/**
 * Role guard - checks if user has required role.
 * @param {Array|string} roles - Required roles
 * @returns {Function} Guard function
 */
export function requireRoles(roles) {
  const required = Array.isArray(roles) ? roles : [roles];
  
  return (to, from, next) => {
    const authStore = useAuthStore();
    
    if (!authStore.user) {
      next({ name: 'login' });
      return;
    }
    
    const hasRole = required.some(role => 
      authStore.user.roles?.includes(role)
    );
    
    if (hasRole) {
      next();
    } else {
      next({ name: 'unauthorized' });
    }
  };
}