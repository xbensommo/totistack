import { getFriendlyMessage } from '@xbensommo/shard-provider'
import { normalizeAuthError } from '@/features/auth/utils/auth.errors.js'

/**
 * Check whether a message is safe and useful for UI.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isUsableMessage(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Convert unknown errors into a safe app error.
 *
 * Order:
 * 1. shard-provider friendly message
 * 2. auth feature fallback
 * 3. provided fallback
 *
 * @param {unknown} error
 * @param {string} [fallback='Something went wrong.']
 * @returns {{ code: string, message: string, cause: unknown }}
 */
export function toAppError(error, fallback = 'Something went wrong.') {
  const code = error?.code || 'app/unknown'

  const shardMessage = getFriendlyMessage(error)
  if (isUsableMessage(shardMessage)) {
    return {
      code,
      message: shardMessage,
      cause: error,
    }
  }

  if (typeof code === 'string' && code.startsWith('auth/')) {
    const authError = normalizeAuthError(error)

    if (isUsableMessage(authError?.message)) {
      return {
        code: authError.code || code,
        message: authError.message,
        cause: error,
      }
    }
  }

  return {
    code,
    message: fallback,
    cause: error,
  }
}