/**
 * @file vite-config.mutator.js
 * @description Mutator for Vite config file.
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';
import { InstallError } from '../errors/index.js';

/**
 * Update Vite config to include aliases, plugins, etc.
 * @param {string} projectRoot - Project root.
 * @param {object} options - Options for update.
 * @returns {Promise<void>}
 */
export async function mutateViteConfig(projectRoot, options) {
  const configPath = path.join(projectRoot, 'vite.config.js');
  if (!await fs.pathExists(configPath)) {
    throw new InstallError('vite.config.js not found');
  }

  let content = await fs.readFile(configPath, 'utf8');
  // Simple string manipulation for demonstration; in practice, use AST parsing.
  if (options.alias) {
    const aliasEntries = Object.entries(options.alias)
      .map(([find, replacement]) => `{ find: '${find}', replacement: '${replacement}' }`)
      .join(',\n    ');
    const aliasBlock = `alias: [\n    ${aliasEntries}\n  ],`;
    content = content.replace(/alias:\s*\[[^\]]*\]/, aliasBlock);
  }

  await fs.writeFile(configPath, content);
  logger.info('Updated vite.config.js');
}