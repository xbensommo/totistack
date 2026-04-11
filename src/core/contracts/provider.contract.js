/**
 * @file provider.contract.js
 * @description Contract for provider definitions (e.g., Firestore).
 * @date 2026-03-22
 * @author Totistack Team
 */

/**
 * @typedef {object} ProviderContract
 * @property {string} name - Provider name.
 * @property {string} version - Version.
 * @property {Function} setup - Setup function.
 */

/**
 * Validate a provider.
 * @param {unknown} provider - Provider object.
 * @returns {ProviderContract}
 * @throws {Error}
 */
export function validateProvider(provider) {
  if (!provider || typeof provider !== 'object') {
    throw new Error('Provider must be an object');
  }
  if (!provider.name || typeof provider.name !== 'string') {
    throw new Error('Provider must have a name');
  }
  if (typeof provider.setup !== 'function') {
    throw new Error('Provider must have a setup function');
  }
  return provider;
}