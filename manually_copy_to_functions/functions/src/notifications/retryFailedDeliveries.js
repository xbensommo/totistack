/** @file functions/src/notifications/retryFailedDeliveries.js */

import { db, FieldValue } from '../bootstrap/admin.js'
import { COLLECTIONS } from '../constants/collections.js'

export async function retryFailedDeliveries() {
  const snap = await db.collection(COLLECTIONS.NOTIFICATION_DELIVERIES)
    .where('status', '==', 'failed')
    .where('isDeleted', '==', false)
    .limit(50)
    .get()

  if (snap.empty) return

  const batch = db.batch()
  snap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: 'retry_pending',
      nextRetryAt: FieldValue.serverTimestamp(),
    })
  })

  await batch.commit()
}
