/**
 * @file src/features/auth/server-actions/auth.server-actions.js
 * @description Client-side wrappers for trusted Cloud Functions auth control-plane actions.
 *
 * Browser code must call these functions for privileged access changes. It must not write
 * role, permissions, status, audit evidence, or session revocation fields directly.
 */

import { httpsCallable } from 'firebase/functions'

const FUNCTION_NAMES = Object.freeze({
  completeSignup: 'completeSignup',
  createUserByInvite: 'createUserByInvite',
  createUserBySignup: 'createUserBySignup',
  createInvite: 'createInvite',
  assignUserRole: 'assignUserRole',
  grantUserPermission: 'grantUserPermission',
  denyUserPermission: 'denyUserPermission',
  suspendUser: 'suspendUser',
  restoreUser: 'restoreUser',
  revokeUserSessions: 'revokeUserSessions',
  syncUserClaims: 'syncUserClaims',
  syncCurrentUserClaims: 'syncCurrentUserClaims',
  recordAuditEvent: 'recordAuditEvent',
})

function normalizeCallableResult(result) {
  return result?.data ?? result
}

function requiredFunctions(functions) {
  if (!functions) throw new Error('[auth/server-actions] Firebase Functions instance is required.')
  return functions
}

function createCallable(functions, name, options = {}) {
  return httpsCallable(requiredFunctions(functions), options.names?.[name] || FUNCTION_NAMES[name] || name)
}

/**
 * Creates strongly named server-action methods backed by Firebase callable functions.
 *
 * @param {object} params
 * @param {import('firebase/functions').Functions} params.functions Firebase Functions instance.
 * @param {object} [params.names] Optional function-name overrides.
 * @returns {object} Auth server action client.
 */
export function createAuthServerActions({ functions, names = {} } = {}) {
  const options = { names }
  const call = (name, payload = {}) => createCallable(functions, name, options)(payload).then(normalizeCallableResult)

  return {
    completeSignup(payload = {}) {
      return call('completeSignup', payload)
    },

    createUserBySignup(payload = {}) {
      return call('createUserBySignup', payload)
    },

    createUserByInvite(payload = {}) {
      return call('createUserByInvite', payload)
    },

    createInvite(payload = {}) {
      return call('createInvite', payload)
    },

    assignUserRole(uid, role, payload = {}) {
      return call('assignUserRole', { uid, role, ...payload })
    },

    grantUserPermission(uid, permissions = [], payload = {}) {
      return call('grantUserPermission', { uid, permissions, ...payload })
    },

    denyUserPermission(uid, permissions = [], payload = {}) {
      return call('denyUserPermission', { uid, permissions, ...payload })
    },

    suspendUser(uid, reason = '') {
      return call('suspendUser', { uid, reason })
    },

    restoreUser(uid, reason = '') {
      return call('restoreUser', { uid, reason })
    },

    revokeUserSessions(uid, reason = '') {
      return call('revokeUserSessions', { uid, reason })
    },

    syncUserClaims(uid) {
      return call('syncUserClaims', { uid })
    },

    syncCurrentUserClaims() {
      return call('syncCurrentUserClaims', {})
    },

    recordAuditEvent(payload = {}) {
      return call('recordAuditEvent', payload)
    },
  }
}

export default createAuthServerActions
