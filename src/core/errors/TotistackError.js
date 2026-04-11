/**
 * @file TotistackError.js
 * @description Base error class for all Totistack-specific errors.
 * @date 2026-03-22
 * @author Totistack Team
 */

/**
 * Base error class for Totistack.
 * @class TotistackError
 * @extends Error
 */
export class TotistackError extends Error {
  /**
   * Create a Totistack error.
   * @param {string} message - Error message.
   * @param {object} [options] - Additional options.
   * @param {string} [options.code] - Error code.
   * @param {any} [options.cause] - Original error cause.
   */
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || 'TOTISTACK_ERROR';
    this.cause = options.cause;
    Error.captureStackTrace(this, this.constructor);
  }
}