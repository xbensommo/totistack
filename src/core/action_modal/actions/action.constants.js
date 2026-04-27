/**
 * @file src/core/actions/action.constants.js
 * @description Shared constants for the Totistack action pipeline.
 */

/**
 * Action execution lifecycle states.
 * @readonly
 * @enum {string}
 */
export const ACTION_STATUS = Object.freeze({
  IDLE: 'idle',
  PENDING_CONFIRMATION: 'pending_confirmation',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
});

/**
 * Confirmation UI variants.
 * @readonly
 * @enum {string}
 */
export const CONFIRM_VARIANT = Object.freeze({
  DEFAULT: 'default',
  WARNING: 'warning',
  DANGER: 'danger',
  SUCCESS: 'success',
});

/**
 * Symbol used to mark expected user cancellation.
 * @type {symbol}
 */
export const ACTION_CANCELLED = Symbol('TOTISTACK_ACTION_CANCELLED');
