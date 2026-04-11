/**
 * @file ResolveError.js
 * @description Error thrown during dependency resolution.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { TotistackError } from './TotistackError.js';

/**
 * Resolution error.
 * @class ResolveError
 * @extends TotistackError
 */
export class ResolveError extends TotistackError {
  /**
   * Create a resolution error.
   * @param {string} message - Error message.
   * @param {object} [options] - Additional options.
   * @param {string} [options.code] - Error code.
   */
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code || 'RESOLVE_ERROR' });
  }
}