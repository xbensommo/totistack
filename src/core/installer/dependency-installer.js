/**
 * @file dependency-installer.js
 * @description Installs npm dependencies for selected apps/features.
 * @date 2026-03-22
 * @author Totistack Team
 */

import { execa } from 'execa';
import { logger } from '../utils/index.js';
import { InstallError } from '../errors/index.js';

/**
 * Install npm packages in a project.
 * @param {string[]} packages - List of package names.
 * @param {string} projectRoot - Project root.
 * @param {string} packageManager - 'npm', 'yarn', or 'pnpm'.
 * @returns {Promise<void>}
 */
export async function installDependencies(packages, projectRoot, packageManager = 'npm') {
  if (!packages.length) return;

  let command;
  let args;

  switch (packageManager) {
    case 'npm':
      command = 'npm';
      args = ['install', '--save', ...packages];
      break;
    case 'yarn':
      command = 'yarn';
      args = ['add', ...packages];
      break;
    case 'pnpm':
      command = 'pnpm';
      args = ['add', ...packages];
      break;
    default:
      throw new InstallError(`Unsupported package manager: ${packageManager}`);
  }

  logger.info(`Installing dependencies: ${packages.join(', ')} using ${packageManager}`);
  try {
    await execa(command, args, { cwd: projectRoot, stdio: 'inherit' });
  } catch (err) {
    throw new InstallError(`Failed to install dependencies: ${err.message}`, { cause: err });
  }
}