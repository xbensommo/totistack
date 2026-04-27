/**
 * @file src/features/auth/index.js
 * @description Totistack auth feature entry.
 */

import manifest from './feature.manifest.js'
import routes from './routes.js'
import AUTH_PERMISSIONS from './permissions.js'

export { manifest, routes, AUTH_PERMISSIONS }
export * from './permissions.js'
export * from './services/create-auth-access-service.js'
export * from './guards/authGuard.js'
export * from './guards/guestGuard.js'
export * from './hooks/use-auth.js'
export * from './auth.actions.js'

export default {
  manifest,
  routes,
}
