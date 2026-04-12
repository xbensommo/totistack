/**
 * @file src/features/auth/guards/authGuard.js
 * @description Generic auth-only route guard with pluggable auth service resolution.
 */

/**
 * Resolve an auth service from options or runtime globals.
 *
 * @param {object} options
 * @returns {object|null}
 */
function resolveAuthService(options = {}) {
  const directService = options.service || options.authService || null
  if (directService && typeof directService === 'object') {
    return directService
  }

  if (typeof options.getService === 'function') {
    const service = options.getService()
    if (service && typeof service === 'object') {
      return service
    }
  }

  const globalService = globalThis.__TOTISTACK_AUTH_SERVICE__ || globalThis.authService || null
  return globalService && typeof globalService === 'object' ? globalService : null
}

/**
 * Wait for the auth layer to be ready when the implementation supports it.
 *
 * @param {object|null} service
 * @returns {Promise<void>}
 */
async function ensureReady(service) {
  if (!service) return

  if (typeof service.waitForInitialAuthState === 'function') {
    await service.waitForInitialAuthState()
    return
  }

  if (typeof service.initialize === 'function') {
    await service.initialize()
  }
}

/**
 * Resolve the current authenticated user from different auth-service shapes.
 *
 * @param {object|null} service
 * @returns {any|null}
 */
function getCurrentUser(service) {
  if (!service) return null

  if (typeof service.getCurrentUser === 'function') {
    return service.getCurrentUser()
  }

  if ('currentUser' in service) {
    return service.currentUser || null
  }

  if (service.auth && 'currentUser' in service.auth) {
    return service.auth.currentUser || null
  }

  return null
}

/**
 * Create a navigation guard that redirects unauthenticated users.
 *
 * @param {{ redirect?: string, service?: object, authService?: object, getService?: Function }} [options={}]
 * @returns {(to: import('vue-router').RouteLocationNormalizedLoaded) => Promise<true | { path: string, query?: Record<string, string> }>}
 */
export function createAuthGuard(options = {}) {
  const redirect = options.redirect || '/auth'

  return async (to) => {
    const service = resolveAuthService(options)
    await ensureReady(service)

    const user = getCurrentUser(service)
    if (user) {
      return true
    }

    return {
      path: redirect,
      query: {
        redirect: to?.fullPath || to?.path || '/',
      },
    }
  }
}

export default createAuthGuard
