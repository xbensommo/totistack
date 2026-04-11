/**
 * @file feature-installer.js
 * @description Handles installation of a feature into a project.
 * @date 2026-03-22
 * @author Totistack Team
 */

import path from 'path';
import { copyDir } from '../utils/file.js';
import { logger } from '../utils/index.js';
import { InstallError } from '../errors/index.js';

export async function installFeature(featureEntry, projectRoot) {
  try {
    const srcDir = featureEntry.dir;
    const destDir = path.join(projectRoot, 'src', 'features', featureEntry.id);
    await copyDir(srcDir, destDir);
    logger.info(`Installed feature ${featureEntry.id} to ${destDir}`);
  } catch (err) {
    throw new InstallError(`Failed to install feature ${featureEntry.id}: ${err.message}`, { cause: err });
  }
}