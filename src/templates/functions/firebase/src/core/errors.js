/** @file functions/src/core/errors.js */

import { HttpsError } from 'firebase-functions/v2/https'

export function fail(code, message, details = undefined) {
  throw new HttpsError(code, message, details)
}

export function toPlainError(error) {
  return {
    code: error?.code || error?.name || 'unknown',
    message: error?.message || 'Unknown error',
    details: error?.details || null,
  }
}

export function publicErrorMessage(error) {
  return error?.message || 'The operation failed.'
}
