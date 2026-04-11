/**
 * @file preset-registry.js
 * @description Registry for presets with cross-platform ESM support.
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
import { getPresetsDir } from '../utils/path.js';
import { validatePreset } from '../contracts/index.js';
import { logger } from '../utils/index.js';

/**
 * @typedef {object} PresetEntry
 * @property {string} id - Preset ID.
 * @property {object} definition - Preset definition.
 */

export class PresetRegistry {
  constructor() {
    /** @type {Map<string, PresetEntry>} */
    this.presets = new Map();
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
   * Load all presets from the presets directory
   * @async
   * @returns {Promise<void>}
   */
  async load() {
    const presetsDir = getPresetsDir();
    
    if (!await fs.pathExists(presetsDir)) {
      logger.warn('Presets directory not found:', presetsDir);
      return;
    }
    
    logger.info(`Loading presets from: ${presetsDir}`);
    
    const files = await fs.readdir(presetsDir);
    let loadedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.preset.js')) {
        const filePath = path.join(presetsDir, file);
        logger.debug(`Found preset file: ${filePath}`);
        
        try {
          // Convert Windows path to file:// URL for ESM compatibility
          const fileUrl = this._toFileURL(filePath);
          logger.debug(`Importing preset from URL: ${fileUrl}`);
          
          const presetModule = await import(fileUrl);
          const preset = presetModule.default || presetModule;
          
          // Validate preset structure
          const validated = validatePreset(preset);
          
          // Store in registry
          this.presets.set(validated.id, {
            id: validated.id,
            definition: validated,
          });
          
          loadedCount++;
          logger.info(`✓ Loaded preset: ${validated.id}`);
          logger.debug(`Preset ${validated.id} details:`, {
            apps: validated.apps?.length || 0,
            features: validated.features?.length || 0,
          });
          
        } catch (err) {
          errorCount++;
          logger.error(`✗ Failed to load preset ${file}:`, err.message);
          
          // Log more details for debugging
          if (err.code === 'ERR_INVALID_URL') {
            logger.error(`  Path issue: ${filePath} - Ensure path is valid`);
          } else if (err.code === 'MODULE_NOT_FOUND') {
            logger.error(`  Module not found: ${err.message}`);
          } else {
            logger.debug(`  Error stack: ${err.stack}`);
          }
        }
      }
    }
    
    logger.info(`Preset registry load complete: ${loadedCount} loaded, ${errorCount} failed`);
  }

  /**
   * Get a preset by ID
   * @param {string} id - Preset identifier
   * @returns {PresetEntry|undefined}
   */
  get(id) {
    return this.presets.get(id);
  }

  /**
   * Get all loaded presets
   * @returns {PresetEntry[]}
   */
  getAll() {
    return Array.from(this.presets.values());
  }

  /**
   * Check if a preset exists
   * @param {string} id - Preset identifier
   * @returns {boolean}
   */
  has(id) {
    return this.presets.has(id);
  }

  /**
   * Get preset count
   * @returns {number}
   */
  size() {
    return this.presets.size;
  }

  /**
   * Clear all loaded presets
   */
  clear() {
    this.presets.clear();
    logger.debug('Preset registry cleared');
  }
}