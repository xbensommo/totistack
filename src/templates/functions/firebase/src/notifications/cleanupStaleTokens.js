/** @file functions/src/notifications/cleanupStaleTokens.js */

import { db, FieldValue, Timestamp } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'

const DEFAULT_STALE_DAYS = 90

export async function cleanupStaleTokens() {
  const staleDays = Number(process.env.FCM_STALE_TOKEN_DAYS || DEFAULT_STALE_DAYS)
  const staleBefore = Timestamp.fromMillis(Date.now() - staleDays * 24 * 60 * 60 * 1000)

  const snap = await db.collection(COLLECTIONS.NOTIFICATION_TOKENS)
    .where('enabled', '==', true)
    .where('lastSeenAt', '<', staleBefore)
    .limit(200)
    .get()

  if (snap.empty) return

  const batch = db.batch()
  snap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      enabled: false,
      revokedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  })

  await batch.commit()
}
