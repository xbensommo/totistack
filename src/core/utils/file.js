/**
 * @file file.js
 * @description File system utilities for reading/writing/manipulating files.
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Recursively copy a directory.
 * @param {string} src - Source path.
 * @param {string} dest - Destination path.
 * @returns {Promise<void>}
 */
export async function copyDir(src, dest) {
  await fs.ensureDir(dest);
  await fs.copy(src, dest);
}

/**
 * Ensure a file exists, creating parent directories if needed.
 * @param {string} filePath - Path to file.
 * @returns {Promise<void>}
 */
export async function ensureFile(filePath) {
  await fs.ensureFile(filePath);
}

/**
 * Write a file with content, ensuring directories exist.
 * @param {string} filePath - Path to file.
 * @param {string|Buffer} content - File content.
 * @returns {Promise<void>}
 */
export async function writeFile(filePath, content) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

/**
 * Read a file as string.
 * @param {string} filePath - Path to file.
 * @returns {Promise<string>}
 */
export async function readFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

/**
 * Check if a path exists.
 * @param {string} filePath - Path to check.
 * @returns {Promise<boolean>}
 */
export async function exists(filePath) {
  return fs.pathExists(filePath);
}

/**
 * Recursively remove a directory.
 * @param {string} dir - Directory path.
 * @returns {Promise<void>}
 */
export async function removeDir(dir) {
  await fs.remove(dir);
}