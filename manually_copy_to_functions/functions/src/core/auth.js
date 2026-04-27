/** @file functions/src/core/auth.js */

import { fail } from './errors.js'

export function assertAuthenticated(request) {
  const uid = request?.auth?.uid
  if (!uid) {
    fail('unauthenticated', 'Authentication is required.')
  }

  return {
    uid,
    email: request.auth.token?.email || null,
    name: request.auth.token?.name || null,
    token: request.auth.token || {},
  }
}
