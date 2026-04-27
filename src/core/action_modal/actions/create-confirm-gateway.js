/**
 * @file src/core/actions/create-confirm-gateway.js
 * @description Headless confirmation gateway used by the action executor.
 */

/**
 * @typedef {Object} ConfirmRequest
 * @property {string} title
 * @property {string} message
 * @property {string} confirmText
 * @property {string} cancelText
 * @property {'default'|'warning'|'danger'|'success'} variant
 * @property {string|null} [icon]
 * @property {boolean} [requireTypedConfirmation]
 * @property {string} [expectedText]
 */

/**
 * @typedef {(request: ConfirmRequest) => Promise<boolean>} ConfirmAdapter
 */

/**
 * Create a confirm gateway.
 *
 * @param {ConfirmAdapter} adapter
 * @returns {{ request: ConfirmAdapter }}
 */
export function createConfirmGateway(adapter) {
  if (typeof adapter !== 'function') {
    throw new TypeError('createConfirmGateway(adapter) requires a function.');
  }

  return {
    request(request) {
      return Promise.resolve(adapter(request));
    },
  };
}
