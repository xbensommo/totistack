/**
 * @file src/features/auth/guards/accessGuard.js
 * @description Route guard that enforces authentication, roles, permissions, MFA and account status.
 */

import { evaluateAccess } from '../services/access-control.service.js'

function resolveAuthService(options = {}) {
  const directService = options.service || options.authService || null
  if (directService && typeof directService === 'object') return directService
  if (typeof options.getService === 'function') return options.getService()
  const globalService = globalThis.__TOTISTACK_AUTH_SERVICE__ || globalThis.authService || null
  return globalService && typeof globalService === 'object' ? globalService : null
}

async function ensureReady(service) {
  if (!service) return
  if (typeof service.waitForInitialAuthState === 'function') return service.waitForInitialAuthState()
  if (typeof service.initialize === 'function') return service.initialize()
}

function getCurrentAccess(service) {
  if (!service) return null
  if (typeof service.getCurrentAccess === 'function') return service.getCurrentAccess()
  if (typeof service.getCurrentUser === 'function') return service.getCurrentUser()
  if ('currentAccess' in service) return service.currentAccess || null
  if ('currentUser' in service) return service.currentUser || null
  if (service.auth && 'currentUser' in service.auth) return service.auth.currentUser || null
  return null
}

/**
 * @param {{ redirect?: string, forbiddenRedirect?: string, service?: object, authService?: object, getService?: Function, config?: object }} [options={}]
 */
export function createAccessGuard(options = {}) {
  const loginRedirect = options.redirect || '/auth'
  const forbiddenRedirect = options.forbiddenRedirect || '/403'

  return async (to) => {
    const service = resolveAuthService(options)
    await ensureReady(service)

    const actor = getCurrentAccess(service)
    const requiresAuth = Boolean(to?.meta?.requiresAuth || to?.meta?.permissions?.length || to?.meta?.roles?.length)

    if (requiresAuth && !actor) {
      return { path: loginRedirect, query: { redirect: to?.fullPath || to?.path || '/' } }
    }

    if (!requiresAuth) return true

    const decision = evaluateAccess({ actor, routeMeta: to?.meta || {}, config: options.config || {} })
    if (decision.allowed) return true

    if (typeof options.onDeny === 'function') {
      await options.onDeny({ to, actor, decision })
    }

    return {
      path: decision.reason === 'AUTH_REQUIRED' ? loginRedirect : forbiddenRedirect,
      query: { reason: decision.reason, redirect: to?.fullPath || to?.path || '/' },
    }
  }
}

export default createAccessGuard
