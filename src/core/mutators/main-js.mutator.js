/**
 * @file main-js.mutator.js
 * @description Mutator for main.js (entry point).
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';
import { InstallError } from '../errors/index.js';

/**
 * Update main.js to include plugins, stores, etc.
 * @param {string} projectRoot - Project root.
 * @param {object} imports - Imports to add.
 * @returns {Promise<void>}
 */
export async function mutateMainJs(projectRoot, imports) {
  const mainPath = path.join(projectRoot, 'src', 'main.js');
  if (!await fs.pathExists(mainPath)) {
    throw new InstallError('src/main.js not found');
  }

  let content = await fs.readFile(mainPath, 'utf8');
  // Insert imports at the top
  for (const imp of imports) {
    content = imp + '\n' + content;
  }
  // Also modify app.use lines if needed (simplistic)
  // In practice, more sophisticated parsing.

  await fs.writeFile(mainPath, content);
  logger.info('Updated main.js');
}