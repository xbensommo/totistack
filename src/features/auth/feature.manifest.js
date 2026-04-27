/**
 * @file src/features/auth/feature.manifest.js
 * @description Declarative authentication and access-control feature manifest.
 */

import permissionsMeta, { AUTH_ROLE_TEMPLATES } from './permissions.js'

export default {
  id: 'auth',
  type: 'feature',
  name: 'Authentication & Access Control',
  version: '2.2.13',
  description: 'Firebase authentication with server-action security control plane, custom claims, invite/public signup policy, least-privilege RBAC, access reviews, session evidence, and SOC 2-ready control hooks.',
  dependencies: { features: [], apps: [] },
  optionalFeatures: ['audit'],
  collections: [
    'users',
    'roles',
    'sessions',
    'user_invites',
    'password_reset_tokens',
    'access_reviews',
    'security_policies',
  ],
  permissions: permissionsMeta.permissions,
  roleTemplates: AUTH_ROLE_TEMPLATES,
  capabilities: {
    firebaseAuth: true,
    rbac: true,
    permissionChecks: true,
    deniedPermissions: true,
    accessReviews: true,
    sessionEvidence: true,
    mfaPolicyHooks: true,
    auditIntegration: true,
    cloudFunctionsControlPlane: true,
    customClaims: true,
    inviteOnlySignup: true,
    publicSignupPolicy: true,
    bootstrapSysAdminSeeder: true,
  },
}
