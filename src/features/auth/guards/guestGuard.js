/**
 * @file src/features/auth/guards/guestGuard.js
 * @description Guard that keeps authenticated users away from guest-only routes.
 */

/**
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
 * Create a navigation guard that redirects authenticated users away from
 * guest-only pages such as login and registration.
 *
 * @param {{ redirect?: string, service?: object, authService?: object, getService?: Function }} [options={}]
 * @returns {() => Promise<true | { path: string }>}
 */
export function createGuestGuard(options = {}) {
  const redirect = options.redirect || '/'

  return async () => {
    const service = resolveAuthService(options)
    await ensureReady(service)

    const user = getCurrentUser(service)
    if (!user) {
      return true
    }

    return { path: redirect }
  }
}

export default createGuestGuard
