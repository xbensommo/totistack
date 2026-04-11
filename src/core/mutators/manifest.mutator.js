/**
 * @file manifest.mutator.js
 * @description Mutator for module manifest files
 * @date 2026-03-22
 * @author Totistack Team
 */

import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';
import { InstallError } from '../errors/index.js';

/**
 * Update apps.config.js with new app configuration
 * @param {string} projectRoot - Project root
 * @param {string} appId - App ID
 * @param {object} config - App configuration
 * @returns {Promise<void>}
 */
export async function mutateAppsManifest(projectRoot, appId, config) {
  const manifestPath = path.join(projectRoot, 'src', 'config', 'apps.config.js');
  
  if (!await fs.pathExists(manifestPath)) {
    throw new InstallError('apps.config.js not found');
  }

  try {
    let content = await fs.readFile(manifestPath, 'utf8');
    
    // Add app to enabled array
    const enabledRegex = /enabled:\s*\[([\s\S]*?)\]/;
    const enabledMatch = content.match(enabledRegex);
    
    if (enabledMatch) {
      const existing = enabledMatch[1];
      const newEnabled = existing.trim() ? `${existing}, '${appId}'` : `'${appId}'`;
      content = content.replace(enabledRegex, `enabled: [${newEnabled}]`);
    }
    
    // Add app configuration
    const appsRegex = /apps:\s*{([\s\S]*?)\}/;
    const appsMatch = content.match(appsRegex);
    
    if (appsMatch) {
      const existing = appsMatch[1];
      const appConfig = `\n  '${appId}': {\n    enabled: true,\n    ${Object.entries(config).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(',\n    ')}\n  },`;
      const newApps = existing + appConfig;
      content = content.replace(appsRegex, `apps: {${newApps}\n}`);
    }
    
    await fs.writeFile(manifestPath, content);
    logger.info(`Updated apps.config.js with ${appId}`);
  } catch (err) {
    throw new InstallError(`Failed to update apps manifest: ${err.message}`, { cause: err });
  }
}

/**
 * Update features.config.js with new feature configuration
 * @param {string} projectRoot - Project root
 * @param {string} featureId - Feature ID
 * @param {object} config - Feature configuration
 * @returns {Promise<void>}
 */
export async function mutateFeaturesManifest(projectRoot, featureId, config) {
  const manifestPath = path.join(projectRoot, 'src', 'config', 'features.config.js');
  
  if (!await fs.pathExists(manifestPath)) {
    throw new InstallError('features.config.js not found');
  }

  try {
    let content = await fs.readFile(manifestPath, 'utf8');
    
    // Add feature to enabled array
    const enabledRegex = /enabled:\s*\[([\s\S]*?)\]/;
    const enabledMatch = content.match(enabledRegex);
    
    if (enabledMatch) {
      const existing = enabledMatch[1];
      const newEnabled = existing.trim() ? `${existing}, '${featureId}'` : `'${featureId}'`;
      content = content.replace(enabledRegex, `enabled: [${newEnabled}]`);
    }
    
    // Add feature configuration
    const featuresRegex = /features:\s*{([\s\S]*?)\}/;
    const featuresMatch = content.match(featuresRegex);
    
    if (featuresMatch) {
      const existing = featuresMatch[1];
      const featureConfig = `\n  '${featureId}': {\n    enabled: true,\n    ${Object.entries(config).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(',\n    ')}\n  },`;
      const newFeatures = existing + featureConfig;
      content = content.replace(featuresRegex, `features: {${newFeatures}\n}`);
    }
    
    await fs.writeFile(manifestPath, content);
    logger.info(`Updated features.config.js with ${featureId}`);
  } catch (err) {
    throw new InstallError(`Failed to update features manifest: ${err.message}`, { cause: err });
  }
}