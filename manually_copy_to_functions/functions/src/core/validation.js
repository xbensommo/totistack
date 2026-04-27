/** @file functions/src/core/validation.js */

import { fail } from './errors.js'

export function requireString(value, field) {
  if (!value || typeof value !== 'string') {
    fail('invalid-argument', `${field} is required.`)
  }
  return value
}

export function requireObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('invalid-argument', `${field} must be an object.`)
  }
  return value
}

export function validateRequiredFields(input = {}, required = []) {
  for (const field of required) {
    const value = input[field]
    if (value === undefined || value === null || value === '') {
      fail('invalid-argument', `Missing required field: ${field}`)
    }
  }
}

export function assertReasonWhenRequired(reason, required) {
  if (required && (!reason || typeof reason !== 'string' || reason.trim().length < 3)) {
    fail('invalid-argument', 'A clear reason is required for this action.')
  }
}
