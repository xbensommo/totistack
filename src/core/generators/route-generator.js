/**
 * @file route-generator.js
 * @description Backward-compatible route generation entry point.
 *
 * Route assembly now lives in src/generated/routes.js. This wrapper exists so
 * older callers can continue invoking generateRoutes() without knowing about
 * the new assembly layer.
 */

import { generateAssemblyArtifacts } from './assembly-generator.js';
import { logger } from '../utils/logger.js';
import { InstallError } from '../errors/index.js';

/**
 * Generate route assembly artifacts.
 *
 * @param {Array<any>} _moduleRoutes - Deprecated legacy argument.
 * @param {string} projectRoot - Project root.
 * @returns {Promise<void>}
 */
export async function generateRoutes(_moduleRoutes, projectRoot) {
  try {
    await generateAssemblyArtifacts(projectRoot);
    logger.info('Generated route assembly in src/generated/routes.js');
  } catch (error) {
    throw new InstallError(`Failed to generate routes: ${error.message}`, {
      cause: error,
    });
  }
}
