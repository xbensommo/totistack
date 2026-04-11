/**
 * @file template-installer.js
 * @description Enhanced template installer with proper error handling and path resolution
 * @date 2026-03-22
 * @author Totistack Team
 * @changes
 * - FIXED: Path resolution using getTemplatesDir()
 * - ENHANCED: Added recursive template processing
 * - ENHANCED: Added template variable interpolation
 * - ADDED: Support for .tpl file extension
 * - ADDED: Proper error handling with context
 */

import fs from 'fs-extra';
import path from 'path';
import { getTemplatesDir } from '../utils/path.js';
import { logger } from '../utils/logger.js';
import { InstallError } from '../errors/index.js';

/**
 * Install a template directory into the project
 * @async
 * @param {string} templateName - Name or path of the template
 * @param {string} destPath - Destination path
 * @param {object} context - Data to interpolate into templates
 * @returns {Promise<void>}
 * @throws {InstallError} If template not found or installation fails
 */
export async function installTemplate(templateName, destPath, context = {}) {
  let srcPath;
  
  // Check if templateName is a full path or just a name
  if (path.isAbsolute(templateName)) {
    srcPath = templateName;
  } else {
    srcPath = path.join(getTemplatesDir(), templateName);
  }
  
  logger.debug(`Installing template from: ${srcPath}`);
  
  if (!await fs.pathExists(srcPath)) {
    throw new InstallError(`Template not found: ${srcPath}`);
  }

  try {
    await fs.ensureDir(destPath);
    await copyTemplateDirectory(srcPath, destPath, context);
    logger.info(`Template installed: ${templateName} -> ${destPath}`);
  } catch (error) {
    throw new InstallError(`Failed to install template ${templateName}: ${error.message}`, { cause: error });
  }
}

/**
 * Recursively copy template directory with variable interpolation
 * @private
 * @async
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {object} context - Interpolation context
 * @returns {Promise<void>}
 */
async function copyTemplateDirectory(src, dest, context) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, interpolateString(entry.name, context));
    
    if (entry.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyTemplateDirectory(srcPath, destPath, context);
    } else {
      await processTemplateFile(srcPath, destPath, context);
    }
  }
}

/**
 * Process a template file with variable interpolation
 * @private
 * @async
 * @param {string} srcPath - Source file path
 * @param {string} destPath - Destination file path
 * @param {object} context - Interpolation context
 * @returns {Promise<void>}
 */
async function processTemplateFile(srcPath, destPath, context) {
  let content = await fs.readFile(srcPath, 'utf8');
  
  // Interpolate variables
  content = interpolateString(content, context);
  
  // Handle .tpl files by removing the extension
  let finalDestPath = destPath;
  if (destPath.endsWith('.tpl')) {
    finalDestPath = destPath.replace(/\.tpl$/, '');
  }
  
  await fs.writeFile(finalDestPath, content);
  logger.debug(`Processed template file: ${path.basename(srcPath)} -> ${path.basename(finalDestPath)}`);
}

/**
 * Interpolate variables in a string using {{variable}} syntax
 * @private
 * @param {string} str - Input string
 * @param {object} context - Interpolation context
 * @returns {string} Interpolated string
 */
function interpolateString(str, context) {
  return str.replace(/{{(\w+)}}/g, (match, key) => {
    if (context.hasOwnProperty(key)) {
      return context[key];
    }
    
    // Handle nested properties
    const nestedValue = key.split('.').reduce((obj, prop) => {
      return obj && obj[prop] !== undefined ? obj[prop] : match;
    }, context);
    
    return nestedValue !== match ? nestedValue : match;
  });
}

/**
 * Install a single template file
 * @async
 * @param {string} templatePath - Path to template file
 * @param {string} destPath - Destination path
 * @param {object} context - Interpolation context
 * @returns {Promise<void>}
 * @throws {InstallError} If template not found
 */
export async function installTemplateFile(templatePath, destPath, context = {}) {
  let srcPath;
  
  if (path.isAbsolute(templatePath)) {
    srcPath = templatePath;
  } else {
    srcPath = path.join(getTemplatesDir(), templatePath);
  }
  
  if (!await fs.pathExists(srcPath)) {
    throw new InstallError(`Template file not found: ${srcPath}`);
  }
  
  try {
    await fs.ensureDir(path.dirname(destPath));
    await processTemplateFile(srcPath, destPath, context);
    logger.debug(`Template file installed: ${srcPath} -> ${destPath}`);
  } catch (error) {
    throw new InstallError(`Failed to install template file ${templatePath}: ${error.message}`, { cause: error });
  }
}