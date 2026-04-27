/**
 * @file src/core/actions/action.utils.js
 * @description Utility functions for action registration and execution.
 */

import { ActionContractError } from './action.errors.js';
import { CONFIRM_VARIANT } from './action.constants.js';

/**
 * @typedef {Object} ConfirmationConfig
 * @property {string} [title]
 * @property {string} [message]
 * @property {string} [confirmText]
 * @property {string} [cancelText]
 * @property {'default'|'warning'|'danger'|'success'} [variant]
 * @property {string} [icon]
 * @property {boolean} [requireTypedConfirmation]
 * @property {string} [expectedText]
 */

/**
 * @typedef {Object} ActionDefinition
 * @property {string} type
 * @property {(context: Record<string, any>) => (boolean|Promise<boolean>|ConfirmationConfig|Promise<ConfirmationConfig|null>|null|undefined)} [confirm]
 * @property {(context: Record<string, any>) => any|Promise<any>} run
 * @property {(context: Record<string, any>) => void|Promise<void>} [onSuccess]
 * @property {(error: unknown, context: Record<string, any>) => void|Promise<void>} [onError]
 * @property {(context: Record<string, any>) => Record<string, any>} [audit]
 */

/**
 * Validate an action definition.
 *
 * @param {ActionDefinition} definition
 * @returns {ActionDefinition}
 */
export function validateActionDefinition(definition) {
  if (!definition || typeof definition !== 'object') {
    throw new ActionContractError('Action definition must be an object.');
  }

  if (!definition.type || typeof definition.type !== 'string') {
    throw new ActionContractError('Action definition requires a string type.', { definition });
  }

  if (typeof definition.run !== 'function') {
    throw new ActionContractError(`Action '${definition.type}' requires a run(context) function.`, { definition });
  }

  return definition;
}

/**
 * Normalize a confirmation response into a stable contract.
 *
 * @param {boolean|ConfirmationConfig|null|undefined} response
 * @param {string} type
 * @returns {ConfirmationConfig|null}
 */
export function normalizeConfirmation(response, type) {
  if (!response) return null;

  if (response === true) {
    return {
      title: 'Confirm action',
      message: `Are you sure you want to continue with '${type}'?`,
      confirmText: 'Continue',
      cancelText: 'Cancel',
      variant: CONFIRM_VARIANT.DEFAULT,
    };
  }

  return {
    title: response.title || 'Confirm action',
    message: response.message || `Are you sure you want to continue with '${type}'?`,
    confirmText: response.confirmText || 'Continue',
    cancelText: response.cancelText || 'Cancel',
    variant: response.variant || CONFIRM_VARIANT.DEFAULT,
    icon: response.icon || null,
    requireTypedConfirmation: Boolean(response.requireTypedConfirmation),
    expectedText: response.expectedText || '',
  };
}

/**
 * Create a stable action context object.
 *
 * @param {Record<string, any>} input
 * @returns {Record<string, any>}
 */
export function createActionContext(input = {}) {
  return {
    type: input.type || '',
    payload: input.payload || null,
    target: input.target || null,
    meta: input.meta || {},
    actor: input.actor || null,
    services: input.services || {},
    store: input.store || null,
    route: input.route || null,
    now: input.now || (() => new Date().toISOString()),
    ...input,
  };
}
