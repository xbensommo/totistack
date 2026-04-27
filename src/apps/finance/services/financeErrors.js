/**
 * @file src/apps/finance/services/financeErrors.js
 * @description Finance-specific errors and normalization helpers.
 */

export class FinanceError extends Error {
  /**
   * @param {string} message
   * @param {{ code?: string, cause?: unknown, meta?: unknown }} [options]
   */
  constructor(message, options = {}) {
    super(message)
    this.name = 'FinanceError'
    this.code = options.code || 'FINANCE_ERROR'
    this.cause = options.cause
    this.meta = options.meta ?? null
  }
}

export class FinanceValidationError extends FinanceError {
  constructor(message, options = {}) {
    super(message, { code: options.code || 'FINANCE_VALIDATION_ERROR', ...options })
    this.name = 'FinanceValidationError'
  }
}

export class FinanceAuthorizationError extends FinanceError {
  constructor(message, options = {}) {
    super(message, { code: options.code || 'FINANCE_FORBIDDEN', ...options })
    this.name = 'FinanceAuthorizationError'
  }
}

export class FinanceConflictError extends FinanceError {
  constructor(message, options = {}) {
    super(message, { code: options.code || 'FINANCE_CONFLICT', ...options })
    this.name = 'FinanceConflictError'
  }
}

export class FinanceRuntimeError extends FinanceError {
  constructor(message, options = {}) {
    super(message, { code: options.code || 'FINANCE_RUNTIME_ERROR', ...options })
    this.name = 'FinanceRuntimeError'
  }
}

/**
 * Throw when a finance invariant fails.
 *
 * @param {boolean} condition
 * @param {string} message
 * @param {{ code?: string, meta?: unknown, errorClass?: typeof FinanceError }} [options]
 */
export function invariant(condition, message, options = {}) {
  if (!condition) {
    const ErrorClass = options.errorClass || FinanceError
    throw new ErrorClass(message, options)
  }
}

/**
 * Normalize unknown thrown values into a finance-shaped error.
 *
 * @param {unknown} error
 * @param {{ fallbackMessage?: string, code?: string }} [options]
 * @returns {FinanceError}
 */
export function normalizeFinanceError(error, options = {}) {
  if (error instanceof FinanceError) return error

  if (error instanceof Error) {
    return new FinanceError(error.message || options.fallbackMessage || 'Finance operation failed.', {
      code: error.code || options.code || 'FINANCE_ERROR',
      cause: error,
      meta: error.meta ?? null,
    })
  }

  return new FinanceError(options.fallbackMessage || 'Finance operation failed.', {
    code: options.code || 'FINANCE_ERROR',
    cause: error,
  })
}
