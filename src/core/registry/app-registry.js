/**
 * @file app-registry.js
 * @description Registry for app modules, loads all apps from src/apps/.
 * @date 2026-03-22
 * @author Totistack Team
 * @changes
 * - FIXED: Windows ESM path resolution using pathToFileURL
 * - ADDED: Cross-platform file URL conversion
 * - ENHANCED: Error handling with path context
 */

import fs from 'fs-extra';
import path from 'path';
import { pathToFileURL } from 'url';
import { getAppsDir } from '../utils/path.js';
import { validateAppManifest } from '../contracts/index.js';
import { logger } from '../utils/index.js';

/**
 * @typedef {object} AppEntry
 * @property {string} id - App ID.
 * @property {object} manifest - App manifest.
 * @property {string} dir - Directory path.
 */

/**
 * Registry for apps.
 * @class AppRegistry
 */
export class AppRegistry {
  constructor() {
    /** @type {Map<string, AppEntry>} */
    this.apps = new Map();
  }

  /**
   * Convert a file path to a proper URL for ESM import
   * @private
   * @param {string} filePath - Absolute file path
   * @returns {string} File URL suitable for import()
   */
  _toFileURL(filePath) {
    try {
      // Normalize path separators for Windows
      const normalizedPath = path.resolve(filePath);
      // Convert to file:// URL (handles Windows drive letters correctly)
      const fileUrl = pathToFileURL(normalizedPath);
      return fileUrl.href;
    } catch (error) {
      logger.error(`Failed to convert path to URL: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Load all apps from the apps directory.
   * @returns {Promise<void>}
   */
  async load() {
    const appsDir = getAppsDir();
    if (!await fs.pathExists(appsDir)) {
      logger.warn('Apps directory not found:', appsDir);
      return;
    }
    
    logger.info(`Loading apps from: ${appsDir}`);
    
    const entries = await fs.readdir(appsDir, { withFileTypes: true });
    let loadedCount = 0;
    let errorCount = 0;
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const appPath = path.join(appsDir, entry.name);
        const manifestPath = path.join(appPath, 'app.manifest.js');
        
        if (await fs.pathExists(manifestPath)) {
          try {
            // Convert Windows path to file:// URL for ESM compatibility
            const fileUrl = this._toFileURL(manifestPath);
            logger.debug(`Importing app manifest from URL: ${fileUrl}`);
            
            const manifestModule = await import(fileUrl);
            const manifest = manifestModule.default || manifestModule;
            const validated = validateAppManifest(manifest);
            
            this.apps.set(validated.id, {
              id: validated.id,
              manifest: validated,
              dir: appPath,
            });
            
            loadedCount++;
            logger.info(`✓ Loaded app: ${validated.id}`);
            logger.debug(`App ${validated.id} details:`, {
              features: validated.features?.length || 0,
              collections: validated.collections?.length || 0,
            });
            
          } catch (err) {
            errorCount++;
            logger.error(`✗ Failed to load app ${entry.name}:`, err.message);
            
            // Log more details for debugging
            if (err.code === 'ERR_INVALID_URL') {
              logger.error(`  Path issue: ${manifestPath} - Ensure path is valid`);
            } else if (err.code === 'MODULE_NOT_FOUND') {
              logger.error(`  Module not found: ${err.message}`);
            } else {
              logger.debug(`  Error stack: ${err.stack}`);
            }
          }
        }
      }
    }
    
    logger.info(`App registry load complete: ${loadedCount} loaded, ${errorCount} failed`);
  }

  /**
   * Get an app by ID.
   * @param {string} id - App ID.
   * @returns {AppEntry|undefined}
   */
  get(id) {
    return this.apps.get(id);
  }

  /**
   * Get all loaded apps.
   * @returns {AppEntry[]}
   */
  getAll() {
    return Array.from(this.apps.values());
  }

  /**
   * Check if an app exists
   * @param {string} id - App ID.
   * @returns {boolean}
   */
  has(id) {
    return this.apps.has(id);
  }

  /**
   * Get app count
   * @returns {number}
   */
  size() {
    return this.apps.size;
  }

  /**
   * Clear all loaded apps
   */
  clear() {
    this.apps.clear();
    logger.debug('App registry cleared');
  }
}