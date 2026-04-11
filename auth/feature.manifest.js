/**
 * @file src/features/auth/feature.manifest.js
 * @description Auth feature manifest for Totistack.
 */

export default {
  id: 'auth',
  name: 'Authentication',
  version: '1.0.0',
  description: 'Firebase authentication with email/password and social providers',
  dependencies: {
    features: ['rbac']
  },
  
  collections: [
    {
      name: 'users',
      shard: { type: 'monthly', field: 'createdAt' },
      schema: {
        email: { type: 'string', required: true, filterable: true, searchable: true },
        name: { type: 'string', required: true, filterable: true, searchable: true },
        displayName: { type: 'string', searchable: true },
        photoURL: { type: 'string' },
        phoneNumber: { type: 'string', filterable: true },
        emailVerified: { type: 'boolean', filterable: true },
        status: { type: 'string', enum: ['active', 'inactive', 'suspended'], filterable: true, default: 'active' },
        roles: { type: 'array', filterable: true, default: ['user'] },
        lastLoginAt: { type: 'timestamp', sortable: true },
        createdAt: { type: 'timestamp', readonly: true, sortable: true },
        updatedAt: { type: 'timestamp', readonly: true }
      },
      writableFields: ['name', 'displayName', 'photoURL', 'phoneNumber'],
      updateableFields: ['name', 'displayName', 'photoURL', 'phoneNumber', 'status'],
      indexes: [{ fields: ['email'] }, { fields: ['status', 'createdAt'] }],
      search: { mode: 'token-array', fields: ['name', 'email', 'displayName'] }
    },
    {
      name: 'sessions',
      shard: { type: 'daily', field: 'createdAt' },
      schema: {
        userId: { type: 'string', required: true, filterable: true },
        sessionToken: { type: 'string', required: true, filterable: true },
        userAgent: { type: 'string' },
        ipAddress: { type: 'string' },
        expiresAt: { type: 'timestamp', required: true, sortable: true },
        lastActivityAt: { type: 'timestamp', sortable: true },
        isActive: { type: 'boolean', filterable: true, default: true },
        createdAt: { type: 'timestamp', readonly: true }
      },
      writableFields: ['lastActivityAt', 'isActive'],
      updateableFields: ['lastActivityAt', 'isActive'],
      indexes: [{ fields: ['userId', 'isActive'] }, { fields: ['sessionToken'] }]
    }
  ],
  
  routes: [
    { path: '/login', name: 'auth.login', component: 'pages/login.vue', meta: { guest: true, title: 'Sign In' } },
    { path: '/register', name: 'auth.register', component: 'pages/register.vue', meta: { guest: true, title: 'Create Account' } },
    { path: '/forgot-password', name: 'auth.forgot-password', component: 'pages/forgot-password.vue', meta: { guest: true, title: 'Forgot Password' } },
    { path: '/reset-password', name: 'auth.reset-password', component: 'pages/reset-password.vue', meta: { guest: true, title: 'Reset Password' } },
    { path: '/profile', name: 'auth.profile', component: 'pages/profile.vue', meta: { requiresAuth: true, title: 'My Profile' } }
  ],

  hooks: {
    beforeInstall: async (context) => {
      // Validate Firebase is configured
      if (!context.config.firebase) {
        throw new Error('Firebase configuration is required for auth module');
      }
      
      // Check if RBAC module is available
      const rbacModule = context.getModule('rbac');
      if (!rbacModule) {
        throw new Error('RBAC module is required for auth module');
      }
      
      return true;
    },
    
    afterInstall: async (context) => {
      // Initialize auth state listener
      const authStore = context.stores.auth;
      if (authStore) {
        await authStore.initAuthListener();
      }
      
      // Set up default roles if needed
      const rbacService = context.getService('rbac');
      if (rbacService) {
        await rbacService.ensureDefaultRoles();
      }
      
      console.log('Auth module installed successfully');
    }
  }
};