/**
 * @file crud-generator.js
 * @description Generates CRUD files for a collection.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { installCollection } from '../installer/collection-installer.js';

/**
 * Generate CRUD files for a collection.
 * @param {string} collectionName - Collection name.
 * @param {string} appId - App ID.
 * @param {string} projectRoot - Project root.
 * @returns {Promise<void>}
 */
export async function generateCRUD(collectionName, appId, projectRoot) {
  // Delegate to the installer, which already handles creation.
  await installCollection(collectionName, appId, projectRoot);
}