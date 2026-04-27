/** @file functions/src/bootstrap/admin.js */

import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

if (!getApps().length) {
  initializeApp()
}

export const db = getFirestore()
export const messaging = getMessaging()
export { FieldValue, Timestamp }
