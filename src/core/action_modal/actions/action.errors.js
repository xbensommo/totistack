/**
 * @file src/core/actions/action.errors.js
 * @description Error helpers for the Totistack action pipeline.
 */

import { ACTION_CANCELLED } from './action.constants.js';

/**
 * Error thrown when an action is cancelled by the user.
 */
export class ActionCancelledError extends Error {
  /**
   * @param {string} [message='Action cancelled by user.']
   * @param {Record<string, any>} [meta={}]
   */
  constructor(message = 'Action cancelled by user.', meta = {}) {
    super(message);
    this.name = 'ActionCancelledError';
    this.code = 'ACTION_CANCELLED';
    this.meta = meta;
    this.marker = ACTION_CANCELLED;
  }
}

/**
 * Error thrown when an action contract is invalid.
 */
export class ActionContractError extends Error {
  /**
   * @param {string} message
   * @param {Record<string, any>} [meta={}]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = 'ActionContractError';
    this.code = 'ACTION_CONTRACT_INVALID';
    this.meta = meta;
  }
}

/**
 * Determine whether the given error represents a user cancellation.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
export function isActionCancelledError(error) {
  return Boolean(
    error &&
      (error.marker === ACTION_CANCELLED || error.code === 'ACTION_CANCELLED' || error.name === 'ActionCancelledError'),
  );
}
