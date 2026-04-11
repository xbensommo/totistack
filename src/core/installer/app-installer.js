/**
 * @file app-installer.js
 * @description Handles installation of an app into a project.
 * @date 2026-03-22
 * @author Totistack Team
 */

import path from 'path';
import { copyDir } from '../utils/file.js';
import { logger } from '../utils/index.js';
import { InstallError } from '../errors/index.js';

/**
 * Install an app into the generated project.
 *
 * Apps are copied into src/apps so the generated assembly layer can discover
 * them without any additional runtime registration.
 *
 * @param {object} appEntry - App registry entry.
 * @param {string} projectRoot - Root of the generated project.
 * @returns {Promise<void>}
 */
export async function installApp(appEntry, projectRoot) {
  try {
    const appSrcDir = appEntry.dir;
    const appDestDir = path.join(projectRoot, 'src', 'apps', appEntry.id);
    await copyDir(appSrcDir, appDestDir);

    logger.info(`Installed app ${appEntry.id} to ${appDestDir}`);
  } catch (err) {
    throw new InstallError(`Failed to install app ${appEntry.id}: ${err.message}`, { cause: err });
  }
}
