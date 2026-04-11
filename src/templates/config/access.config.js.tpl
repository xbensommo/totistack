/**
 * @file access.config.js
 * @description Authentication and access control configuration.
 *
 * This file allows projects to keep authentication enabled while switching RBAC
 * enforcement on or off without rewriting feature code.
 */

export default {
  enabled: {{authEnabled}},
  persistence: 'local',
  profileCollection: 'users',
  sessionCollection: 'sessions',
  cacheTtlMs: 60 * 60 * 1000,
  tokenRefreshIntervalMs: 45 * 60 * 1000,
  allowRegistration: true,
  socialProviders: {
    google: true,
    github: false,
    microsoft: false,
    facebook: false,
  },
  routes: {
    login: '/auth',
    logoutRedirect: '/auth',
    forbidden: '/403',
    defaultAuthenticated: '/',
  },
  rbac: {
    enabled: {{rbacEnabled}},
    defaultRole: 'user',
    superRoles: ['admin', 'super_admin'],
    assignmentsCollection: 'userRoles',
    rolesCollection: 'roles',
    permissionsCollection: 'permissions',
  },
};
