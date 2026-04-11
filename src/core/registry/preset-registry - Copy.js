/**
 * @file preset-registry.js
 * @description Registry for presets.
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';
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

  async load() {
    const presetsDir = getPresetsDir();
    if (!await fs.pathExists(presetsDir)) {
      logger.warn('Presets directory not found:', presetsDir);
      return;
    }
    //else { logger.info('in preset was found', presetsDir)}
    const files = await fs.readdir(presetsDir);
    for (const file of files) {
      if (file.endsWith('.preset.js')) {
        const filePath = path.join(presetsDir, file);
        logger.info('\n found preset', filePath)
        try {
          const preset = await import(filePath).then(m => m.default || m);
          const validated = validatePreset(preset);
          this.presets.set(validated.id, {
            id: validated.id,
            definition: validated,
          });
          logger.debug(`Loaded preset: ${validated.id}`);
        } catch (err) {
          logger.error(`Failed to load preset ${file}:`, err.message);
        }
      }
    }
  }

  get(id) {
    return this.presets.get(id);
  }

  getAll() {
    return Array.from(this.presets.values());
  }
}