/**
 * @file feature-registry.js
 * @description Registry for feature modules.
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';
import { getFeaturesDir } from '../utils/path.js';
import { validateFeatureManifest } from '../contracts/index.js';
import { logger } from '../utils/index.js';
import { pathToFileURL } from 'url';

/**
 * @typedef {object} FeatureEntry
 * @property {string} id - Feature ID.
 * @property {object} manifest - Feature manifest.
 * @property {string} dir - Directory path.
 */

export class FeatureRegistry {
  constructor() {
    /** @type {Map<string, FeatureEntry>} */
    this.features = new Map();
  }

  async load() {
    const featuresDir = getFeaturesDir();
    if (!await fs.pathExists(featuresDir)) {
      logger.warn('Features directory not found:', featuresDir);
      return;
    }
    const entries = await fs.readdir(featuresDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const featurePath = path.join(featuresDir, entry.name);
        const manifestPath = path.join(featurePath, 'feature.manifest.js');
        if (await fs.pathExists(manifestPath)) {
          try {
            const fileUrl = pathToFileURL(manifestPath);
            const manifest = await import(fileUrl.href).then(m => m.default || m);
            
            const validated = validateFeatureManifest(manifest);
            this.features.set(validated.id, {
              id: validated.id,
              manifest: validated,
              dir: featurePath,
            });
            logger.debug(`Loaded feature: ${validated.id}`);
          } catch (err) {
            logger.error(`Failed to load feature ${entry.name}:`, err.message);
          }
        }
      }
    }
  }

  get(id) {
    return this.features.get(id);
  }

  getAll() {
    return Array.from(this.features.values());
  }
}