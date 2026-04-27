/**
 * @file functions/src/firebase-admin.js
 * @description Firebase Admin SDK bootstrap for production, local scripts, and emulator tests.
 */

import fs from 'node:fs'
import path from 'node:path'
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'

function boolEnv(name, fallback = false) {
  const value = process.env[name]
  if (value == null) return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

function normalizeHost(value) {
  if (!value) return ''
  return String(value).replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export const useFirebaseEmulator = Boolean(
  boolEnv('TOTISTACK_USE_FIREBASE_EMULATOR') ||
  boolEnv('USE_FIREBASE_EMULATOR') ||
  boolEnv('FIREBASE_USE_EMULATOR') ||
  process.env.FIRESTORE_EMULATOR_HOST ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST,
)

function ensureEmulatorEnv() {
  if (!useFirebaseEmulator) return

  process.env.FIRESTORE_EMULATOR_HOST = normalizeHost(
    process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080',
  )

  process.env.FIREBASE_AUTH_EMULATOR_HOST = normalizeHost(
    process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099',
  )

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    'totistack-emulator'

  process.env.FIREBASE_PROJECT_ID = projectId
  process.env.GOOGLE_CLOUD_PROJECT = projectId
  process.env.GCLOUD_PROJECT = projectId
}

function normalizePrivateKey(serviceAccount) {
  if (serviceAccount?.private_key && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
  }
  return serviceAccount
}

function readJsonFile(filePath) {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Firebase service-account file was not found: ${resolvedPath}`)
  }

  return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'))
}

function parseJsonOrBase64(value, label) {
  if (!value) return null

  const trimmed = value.trim()

  try {
    if (trimmed.startsWith('{')) return JSON.parse(trimmed)
    return JSON.parse(Buffer.from(trimmed, 'base64').toString('utf8'))
  } catch (error) {
    throw new Error(`${label} must be valid JSON or base64-encoded JSON. ${error.message}`)
  }
}

function readFirebaseConfig() {
  const raw = process.env.FIREBASE_CONFIG
  if (!raw) return null

  try {
    if (raw.trim().startsWith('{')) return JSON.parse(raw)

    const resolvedPath = path.isAbsolute(raw)
      ? raw
      : path.resolve(process.cwd(), raw)

    if (!fs.existsSync(resolvedPath)) return null

    return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'))
  } catch {
    return null
  }
}

function readServiceAccount() {
  if (useFirebaseEmulator) return null

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return normalizePrivateKey(
      parseJsonOrBase64(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'FIREBASE_SERVICE_ACCOUNT_JSON'),
    )
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return normalizePrivateKey(
      parseJsonOrBase64(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'FIREBASE_SERVICE_ACCOUNT_BASE64'),
    )
  }

  const credentialPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (credentialPath) {
    return normalizePrivateKey(readJsonFile(credentialPath))
  }

  return null
}

function resolveProjectId(serviceAccount, firebaseConfig) {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    serviceAccount?.project_id ||
    firebaseConfig?.projectId ||
    firebaseConfig?.project_id ||
    ''
  )
}

function buildAdminOptions() {
  ensureEmulatorEnv()

  const firebaseConfig = readFirebaseConfig()
  const serviceAccount = readServiceAccount()
  const projectId = resolveProjectId(serviceAccount, firebaseConfig)

  if (!projectId) {
    throw new Error([
      'Unable to detect Firebase project id.',
      'Set FIREBASE_PROJECT_ID, GOOGLE_CLOUD_PROJECT, or GCLOUD_PROJECT.',
      'For production/local real Firebase, also set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_PATH.',
      'For emulator tests, set TOTISTACK_USE_FIREBASE_EMULATOR=true.',
    ].join(' '))
  }

  if (useFirebaseEmulator) {
    return {
      projectId,
      storageBucket: firebaseConfig?.storageBucket || process.env.FIREBASE_STORAGE_BUCKET || undefined,
    }
  }

  return {
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    projectId,
    storageBucket: firebaseConfig?.storageBucket || process.env.FIREBASE_STORAGE_BUCKET || undefined,
  }
}

export const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp(buildAdminOptions())

export const adminAuth = getAuth(adminApp)
export const db = getFirestore(adminApp)

export { FieldValue, Timestamp }
