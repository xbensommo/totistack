/** @file functions/src/core/sanitize.js */

const SENSITIVE_KEYS = new Set([
  'password',
  'passcode',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'apiKey',
  'authorization',
])

export function sanitizeForLog(value, depth = 0) {
  if (depth > 6) return '[MaxDepth]'
  if (value === null || value === undefined) return value
  if (typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((item) => sanitizeForLog(item, depth + 1))

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (SENSITIVE_KEYS.has(key)) return [key, '[REDACTED]']
      return [key, sanitizeForLog(entry, depth + 1)]
    }),
  )
}
