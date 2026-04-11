/**
 * @file env.mutator.js
 * @description Mutator for .env files to add environment variables
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';
import { InstallError } from '../errors/index.js';

/**
 * Update .env files with new variables
 * @param {string} projectRoot - Project root
 * @param {object} variables - Environment variables to add
 * @param {Array} envFiles - List of env files to update
 * @returns {Promise<void>}
 */
export async function mutateEnv(projectRoot, variables, envFiles = ['.env', '.env.example']) {
  for (const envFile of envFiles) {
    const envPath = path.join(projectRoot, envFile);
    
    try {
      let content = '';
      if (await fs.pathExists(envPath)) {
        content = await fs.readFile(envPath, 'utf8');
      }
      
      // Add new variables
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const newLine = `${key}=${value}`;
        
        if (regex.test(content)) {
          content = content.replace(regex, newLine);
        } else {
          content += (content ? '\n' : '') + newLine;
        }
      }
      
      await fs.writeFile(envPath, content);
      logger.info(`Updated ${envFile}`);
    } catch (err) {
      throw new InstallError(`Failed to update ${envFile}: ${err.message}`, { cause: err });
    }
  }
}