/**
 * @file package-json.mutator.js
 * @description Mutator for package.json file.
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';
import { deepMerge } from '../utils/merge.js';
import { logger } from '../utils/index.js';
import { InstallError } from '../errors/index.js';

/**
 * Update package.json with new scripts, dependencies, etc.
 * @param {string} projectRoot - Project root.
 * @param {object} updates - Updates to apply.
 * @returns {Promise<void>}
 */
export async function mutatePackageJson(projectRoot, updates) {
  const filePath = path.join(projectRoot, 'package.json');
  if (!await fs.pathExists(filePath)) {
    throw new InstallError('package.json not found');
  }

  let pkg;
  try {
    pkg = await fs.readJson(filePath);
  } catch (err) {
    throw new InstallError(`Failed to read package.json: ${err.message}`);
  }

  const newPkg = deepMerge(pkg, updates);
  await fs.writeJson(filePath, newPkg, { spaces: 2 });
  logger.info('Updated package.json');
}