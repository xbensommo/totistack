/**
 * @file InstallError.js
 * @description Error thrown during module installation.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { TotistackError } from './TotistackError.js';

/**
 * Installation error.
 * @class InstallError
 * @extends TotistackError
 */
export class InstallError extends TotistackError {
  /**
   * Create an installation error.
   * @param {string} message - Error message.
   * @param {object} [options] - Additional options.
   * @param {string} [options.code] - Error code.
   */
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code || 'INSTALL_ERROR' });
  }
}