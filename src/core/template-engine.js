/**
 * @file template-engine.js
 * @description Lightweight template rendering and directory copy utilities for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Checks whether a file system path exists.
 *
 * @param {string} targetPath - Absolute or relative path to test.
 * @returns {Promise<boolean>} True when the path exists, otherwise false.
 */
export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively lists all files under a directory.
 *
 * @param {string} directory - Root directory to traverse.
 * @returns {Promise<string[]>} Array of absolute file paths.
 */
export async function listFilesRecursive(directory) {
  const results = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(fullPath);
      results.push(...nested);
      continue;
    }

    if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Replaces `{{variableName}}` placeholders inside a string using the supplied variables.
 *
 * Example:
 * `Hello {{name}}` with `{ name: 'Totisoft' }` becomes `Hello Totisoft`
 *
 * Unknown variables are replaced with an empty string.
 *
 * @param {string} content - Template text content.
 * @param {Record<string, any>} variables - Template variable map.
 * @returns {string} Rendered content.
 */
export function renderTemplateString(content, variables = {}) {
  return String(content).replace(/\{\{\s*([a-zA-Z0-9_.$-]+)\s*\}\}/g, (_, key) => {
    const value = key.split('.').reduce((acc, part) => acc?.[part], variables);
    return value == null ? '' : String(value);
  });
}

/**
 * Converts a template file path into an output file path.
 *
 * Conventions:
 * - `.txt` suffix is removed
 * - other names are preserved
 *
 * Examples:
 * - `module.js.txt` -> `module.js`
 * - `firebase.config.json.txt` -> `firebase.config.json`
 *
 * @param {string} relativeTemplatePath - Relative path from template root.
 * @returns {string} Normalized output path.
 */
export function normalizeTemplateOutputPath(relativeTemplatePath) {
  return relativeTemplatePath.endsWith('.txt')
    ? relativeTemplatePath.slice(0, -4)
    : relativeTemplatePath;
}

/**
 * Renders a single template file into a destination path.
 *
 * @param {Object} params - Rendering parameters.
 * @param {string} params.templateFilePath - Absolute path to the source template file.
 * @param {string} params.destinationFilePath - Absolute path to the output file.
 * @param {Record<string, any>} [params.variables={}] - Template variables.
 * @param {boolean} [params.overwrite=false] - Whether to overwrite existing files.
 * @returns {Promise<boolean>} True if the file was written, false if skipped.
 */
export async function renderTemplateFile({
  templateFilePath,
  destinationFilePath,
  variables = {},
  overwrite = false,
}) {
  const outputExists = await pathExists(destinationFilePath);
  if (outputExists && !overwrite) return false;

  const raw = await fs.readFile(templateFilePath, 'utf8');
  const rendered = renderTemplateString(raw, variables);

  await fs.mkdir(path.dirname(destinationFilePath), { recursive: true });
  await fs.writeFile(destinationFilePath, rendered, 'utf8');

  return true;
}

/**
 * Copies and renders all template files from a source directory into a destination directory.
 *
 * Every file is treated as a text template.
 *
 * @param {Object} params - Copy parameters.
 * @param {string} params.templateDir - Absolute path to the template directory.
 * @param {string} params.destinationDir - Absolute path to the output directory.
 * @param {Record<string, any>} [params.variables={}] - Template variables.
 * @param {boolean} [params.overwrite=false] - Whether to overwrite existing files.
 * @returns {Promise<string[]>} Array of written destination file paths.
 */
export async function copyTemplateDirectory({
  templateDir,
  destinationDir,
  variables = {},
  overwrite = false,
}) {
  const exists = await pathExists(templateDir);
  if (!exists) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  const files = await listFilesRecursive(templateDir);
  const writtenFiles = [];

  for (const sourceFilePath of files) {
    const relativePath = path.relative(templateDir, sourceFilePath);
    const outputRelativePath = normalizeTemplateOutputPath(relativePath);
    const destinationFilePath = path.join(destinationDir, outputRelativePath);

    const written = await renderTemplateFile({
      templateFilePath: sourceFilePath,
      destinationFilePath,
      variables,
      overwrite,
    });

    if (written) {
      writtenFiles.push(destinationFilePath);
    }
  }

  return writtenFiles;
}