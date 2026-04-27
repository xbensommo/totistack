/**
 * @file src/features/auth/services/access-control.service.js
 * @description Central authorization policy evaluator for route guards and business actions.
 */

import {
  AUTH_PERMISSIONS,
  AUTH_ROLE_LEVELS,
  AUTH_ROLE_TEMPLATES,
  canAssignRole,
  hasAllAuthPermissions,
  hasAnyAuthPermission,
  normalizePermissionKeys,
  normalizeRoleKeys,
  resolveEffectivePermissions,
} from '../permissions.js'

const DEFAULT_DENIAL = Object.freeze({
  allowed: false,
  reason: 'ACCESS_DENIED',
})

function nowIso() {
  return new Date().toISOString()
}

export function buildAccessContext({ firebaseUser = null, profile = null, config = {} } = {}) {
  const roles = normalizeRoleKeys(profile?.roles || [profile?.role || config?.rbac?.defaultRole || 'user'])
  const permissions = resolveEffectivePermissions({
    ...profile,
    roles,
    role: roles[0],
  }, config?.rbac?.roleTemplates || config?.roleTemplates || AUTH_ROLE_TEMPLATES)

  return {
    uid: firebaseUser?.uid || profile?.uid || profile?.id || null,
    email: firebaseUser?.email || profile?.email || null,
    status: profile?.status || 'active',
    emailVerified: Boolean(firebaseUser?.emailVerified ?? profile?.emailVerified),
    mfaVerified: Boolean(profile?.mfaVerified || profile?.mfaEnrolled || false),
    roles,
    permissions,
    deniedPermissionKeys: normalizePermissionKeys(profile?.deniedPermissionKeys || []),
    claims: roles.reduce((claims, role) => ({ ...claims, [role]: true }), {}),
    accessVersion: Number(profile?.accessVersion || 1),
    evaluatedAt: nowIso(),
  }
}

export function evaluateAccess({
  actor = null,
  routeMeta = null,
  permission = null,
  permissions = null,
  roles = null,
  ownerId = null,
  targetRole = null,
  config = {},
} = {}) {
  if (!actor) {
    return { ...DEFAULT_DENIAL, reason: 'AUTH_REQUIRED' }
  }

  const status = String(actor.status || 'active').toLowerCase()
  if (status !== 'active') {
    return { ...DEFAULT_DENIAL, reason: 'ACCOUNT_NOT_ACTIVE', status }
  }

  const meta = routeMeta || {}
  const requiredRoles = normalizeRoleKeys(roles || meta.roles || [])
  const requiredPermissions = normalizePermissionKeys(permissions || permission || meta.permissions || [])
  const actorRoles = normalizeRoleKeys(actor.roles || [actor.role])

  if (meta.requiresVerifiedEmail && !actor.emailVerified) {
    return { ...DEFAULT_DENIAL, reason: 'EMAIL_VERIFICATION_REQUIRED' }
  }

  if (meta.requiresMfa && !actor.mfaVerified && !actor.mfaEnrolled) {
    return { ...DEFAULT_DENIAL, reason: 'MFA_REQUIRED' }
  }

  if (meta.ownerOnly && ownerId && actor.uid !== ownerId && actor.id !== ownerId) {
    return { ...DEFAULT_DENIAL, reason: 'OWNER_ONLY' }
  }

  if (requiredRoles.length && !requiredRoles.some((role) => actorRoles.includes(role))) {
    return {
      ...DEFAULT_DENIAL,
      reason: 'ROLE_REQUIRED',
      requiredRoles,
      actorRoles,
    }
  }

  if (requiredPermissions.length && !hasAllAuthPermissions(actor, requiredPermissions, {
    roleTemplates: config?.rbac?.roleTemplates || config?.roleTemplates || AUTH_ROLE_TEMPLATES,
  })) {
    const granted = resolveEffectivePermissions(actor, config?.rbac?.roleTemplates || config?.roleTemplates || AUTH_ROLE_TEMPLATES)
    return {
      ...DEFAULT_DENIAL,
      reason: 'PERMISSION_REQUIRED',
      requiredPermissions,
      missingPermissions: requiredPermissions.filter((key) => !granted.includes(key)),
    }
  }

  if (targetRole && !canAssignRole(actor, targetRole, {
    roleLevels: config?.rbac?.roleLevels || AUTH_ROLE_LEVELS,
    roleTemplates: config?.rbac?.roleTemplates || config?.roleTemplates || AUTH_ROLE_TEMPLATES,
  })) {
    return {
      ...DEFAULT_DENIAL,
      reason: 'ROLE_ASSIGNMENT_FORBIDDEN',
      targetRole,
    }
  }

  return {
    allowed: true,
    reason: 'ALLOW',
    roles: actorRoles,
    permissions: resolveEffectivePermissions(actor, config?.rbac?.roleTemplates || config?.roleTemplates || AUTH_ROLE_TEMPLATES),
    evaluatedAt: nowIso(),
  }
}

export function assertAccess(input = {}) {
  const decision = evaluateAccess(input)
  if (!decision.allowed) {
    const error = new Error(decision.reason || 'ACCESS_DENIED')
    error.code = decision.reason || 'ACCESS_DENIED'
    error.decision = decision
    throw error
  }
  return decision
}

export function createAccessControlService(config = {}) {
  return {
    resolveAccessContext: (input) => buildAccessContext({ ...input, config }),
    evaluateAccess: (input) => evaluateAccess({ ...input, config }),
    assertAccess: (input) => assertAccess({ ...input, config }),
    hasPermission: (actor, key) => hasAnyAuthPermission(actor, [key], {
      roleTemplates: config?.rbac?.roleTemplates || config?.roleTemplates || AUTH_ROLE_TEMPLATES,
    }),
    hasAllPermissions: (actor, keys) => hasAllAuthPermissions(actor, keys, {
      roleTemplates: config?.rbac?.roleTemplates || config?.roleTemplates || AUTH_ROLE_TEMPLATES,
    }),
    canAssignRole: (actor, role) => canAssignRole(actor, role, {
      roleLevels: config?.rbac?.roleLevels || AUTH_ROLE_LEVELS,
      roleTemplates: config?.rbac?.roleTemplates || config?.roleTemplates || AUTH_ROLE_TEMPLATES,
    }),
    permissions: AUTH_PERMISSIONS,
  }
}

export default createAccessControlService
