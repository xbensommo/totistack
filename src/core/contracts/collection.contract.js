/**
 * @file collection.contract.js
 * @description Contract for collection definitions.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ValidationError } from '../errors/index.js';

/**
 * @typedef {object} CollectionContract
 * @property {string} name - Collection name (plural).
 * @property {string} [provider] - Provider type ('firestore').
 * @property {string} [adapter] - Adapter name ('shard-provider').
 * @property {string} [collectionPath] - Firestore collection path.
 * @property {boolean} [softDelete] - Enable soft delete.
 * @property {boolean} [archive] - Enable archiving.
 * @property {object} fields - Field definitions.
 * @property {string[]} [required] - Required field names.
 * @property {string[]} [unique] - Unique field names.
 */

/**
 * Validate a collection definition.
 * @param {unknown} def - Collection definition.
 * @returns {CollectionContract} Validated definition.
 * @throws {ValidationError}
 */
export function validateCollectionDefinition(def) {
  if (!def || typeof def !== 'object') {
    throw new ValidationError('Collection definition must be an object');
  }
  if (!def.name || typeof def.name !== 'string') {
    throw new ValidationError('Collection name is required and must be a string');
  }
  if (def.fields && typeof def.fields !== 'object') {
    throw new ValidationError('Fields must be an object');
  }
  return def;
}