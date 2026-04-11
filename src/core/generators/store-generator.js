/**
 * @file store-generator.js
 * @description Backward-compatible store generation entry point.
 *
 * Store integration is now driven from src/generated/collections.js instead of
 * inferring collection action keys from default store state.
 */

import { generateAssemblyArtifacts } from './assembly-generator.js';
import { logger } from '../utils/logger.js';
import { InstallError } from '../errors/index.js';

/**
 * Generate store assembly artifacts.
 *
 * @param {Array<string>} _moduleNames - Deprecated legacy argument.
 * @param {string} projectRoot - Project root.
 * @returns {Promise<void>}
 */
export async function generateStores(_moduleNames, projectRoot) {
  try {
    await generateAssemblyArtifacts(projectRoot);
    logger.info('Generated store assembly metadata in src/generated/collections.js');
  } catch (error) {
    throw new InstallError(`Failed to generate stores: ${error.message}`, {
      cause: error,
    });
  }
}
