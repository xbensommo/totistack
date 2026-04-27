/** @file functions/src/notifications/tokenFunctions.js */

import { db, FieldValue } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'
import { assertAuthenticated } from '../core/auth.js'
import { requireString } from '../core/validation.js'
import { sha256 } from '../core/hash.js'

export async function registerNotificationToken(request) {
  const auth = assertAuthenticated(request)
  const token = requireString(request.data?.token, 'token')

  const tokenHash = sha256(token)
  const ref = db.collection(COLLECTIONS.NOTIFICATION_TOKENS).doc(tokenHash)

  await ref.set({
    userId: auth.uid,
    tokenHash,
    token,
    platform: request.data?.platform || 'web',
    browser: request.data?.browser || 'unknown',
    deviceLabel: request.data?.deviceLabel || 'Web browser',
    enabled: true,
    lastSeenAt: FieldValue.serverTimestamp(),
    revokedAt: null,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    isDeleted: false,
  }, { merge: true })

  return { ok: true, tokenHash }
}

export async function revokeNotificationToken(request) {
  const auth = assertAuthenticated(request)
  const token = request.data?.token
  const tokenHash = request.data?.tokenHash || (token ? sha256(token) : null)

  if (!tokenHash) {
    throw new Error('token or tokenHash is required.')
  }

  const ref = db.collection(COLLECTIONS.NOTIFICATION_TOKENS).doc(tokenHash)
  const snap = await ref.get()

  if (!snap.exists || snap.data()?.userId !== auth.uid) {
    return { ok: true, revoked: false }
  }

  await ref.update({
    enabled: false,
    revokedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { ok: true, revoked: true }
}
