/**
 * @file path.js
 * @description Enhanced path resolution utilities with validation
 * @date 2026-03-22
 * @author Totistack Team
 * @changes
 * - ADDED: Path validation functions
 * - ADDED: Existence checking
 * - FIXED: Path resolution for templates
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the root directory of the Totistack package
 * @returns {string}
 */
export function getPackageRoot() {
  return path.resolve(__dirname, './../..'); // ../../../
}

/**
 * Get the path to the templates directory
 * @returns {string}
 */
export function getTemplatesDir() {
  return path.join(getPackageRoot(), '', 'templates');
}

/**
 * Get the path to the apps directory
 * @returns {string}
 */
export function getAppsDir() {
  return path.join(getPackageRoot(), '', 'apps');
}

/**
 * Get the path to the features directory
 * @returns {string}
 */
export function getFeaturesDir() {
  return path.join(getPackageRoot(), '', 'features');
}

/**
 * Get the path to the presets directory
 * @returns {string}
 */
export function getPresetsDir() {
  return path.join(getPackageRoot(), '', 'presets');
}

export function getDocumentsDir() {
  return path.join(getPackageRoot(), '', 'documents');
}

/**
 * Get the path to the runtime directory
 * @returns {string}
 */
export function getRuntimeDir() {
  return path.join(getPackageRoot(), '', 'runtime');
}

/**
 * Validate that a path exists
 * @async
 * @param {string} filePath - Path to validate
 * @returns {Promise<boolean>}
 */
export async function validatePathExists(filePath) {
  return await fs.pathExists(filePath);
}

/**
 * Resolve a template path and validate existence
 * @async
 * @param {string} templateName - Template name or relative path
 * @returns {Promise<string>} Resolved absolute path
 * @throws {Error} If template doesn't exist
 */
export async function resolveTemplatePath(templateName) {
  const templatePath = path.join(getTemplatesDir(), templateName);
  
  if (!await validatePathExists(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }
  
  return templatePath;
}