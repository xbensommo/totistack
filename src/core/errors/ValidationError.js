/**
 * @file ValidationError.js
 * @description Error thrown when contract validation fails.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { TotistackError } from './TotistackError.js';

/**
 * Validation error.
 * @class ValidationError
 * @extends TotistackError
 */
export class ValidationError extends TotistackError {
  /**
   * Create a validation error.
   * @param {string} message - Error message.
   * @param {object} [options] - Additional options.
   * @param {string} [options.code] - Error code.
   */
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code || 'VALIDATION_ERROR' });
  }
}