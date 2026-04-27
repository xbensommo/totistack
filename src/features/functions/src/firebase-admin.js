/**
 * @file functions/src/firebase-admin.js
 * @description Shared Firebase Admin SDK bootstrap for Totistack security functions.
 */

import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

const app = getApps().length ? getApps()[0] : initializeApp()

export const adminApp = app
export const adminAuth = getAuth(app)
export const db = getFirestore(app)
export { FieldValue, Timestamp }
