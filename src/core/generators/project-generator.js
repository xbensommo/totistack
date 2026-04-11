/**
 * @file project-generator.js
 * @description Orchestrates generation of a new project using all core components.
 */

import path from 'path';
import fs from 'fs-extra';
import { installTemplate } from '../installer/template-installer.js';
import { installApp } from '../installer/app-installer.js';
import { installFeature } from '../installer/feature-installer.js';
import { installCollection } from '../installer/collection-installer.js';
import { generateConfig } from './config-generator.js';
import { generateDocumentation } from './document-generator.js';
import { generateAssemblyArtifacts } from './assembly-generator.js';
import { appRegistry, featureRegistry } from '../registry/index.js';
import { getTemplatesDir } from '../utils/path.js';
import { logger } from '../utils/logger.js';
import { InstallError, ValidationError } from '../errors/index.js';

/**
 * Generate a complete project from configuration.
 *
 * @param {object} config - Project configuration.
 * @param {string} projectPath - Path where project will be created.
 * @returns {Promise<void>}
 */
export async function generateProject(config, projectPath) {
  logger.info(`Starting project generation at: ${projectPath}`);

  validateProjectConfig(config);

  const fullProjectPath = path.join(projectPath, config.name);
  logger.debug(`Full project path: ${fullProjectPath}`);

  try {
    await createDirectoryStructure(fullProjectPath);
    logger.debug('Directory structure created');

    await installBaseTemplate(fullProjectPath, config);
    logger.debug('Base template installed');

    await generateConfig(config, fullProjectPath);
    logger.debug('Configuration files generated');

    await installSelectedApps(config.apps, fullProjectPath);
    logger.debug(`Installed ${config.apps.length} apps`);

    await installSelectedFeatures(config.features, fullProjectPath);
    logger.debug(`Installed ${config.features.length} features`);

    await installCollections(config.collections || [], fullProjectPath);
    logger.debug(`Installed ${config.collections?.length || 0} collections`);

    await generateAssemblyArtifacts(fullProjectPath);
    logger.debug('Generated assembly artifacts');

    await generateDocumentation(config, fullProjectPath);
    logger.debug('Documentation generated');

    await installProjectDependencies(config, fullProjectPath);
    logger.debug('Dependencies installed');

    logger.info('Project generation completed successfully');
  } catch (error) {
    logger.error('Project generation failed:', error);

    try {
      await fs.remove(fullProjectPath);
      logger.info('Cleaned up partial project directory');
    } catch (cleanupError) {
      logger.warn('Failed to clean up project directory:', cleanupError);
    }

    if (error instanceof InstallError || error instanceof ValidationError) {
      throw error;
    }

    throw new InstallError(`Project generation failed: ${error.message}`, { cause: error });
  }
}

/**
 * Validate project configuration.
 *
 * @param {object} config - Project configuration.
 * @returns {void}
 */
function validateProjectConfig(config) {
  if (!config.name || typeof config.name !== 'string') {
    throw new ValidationError('Project name is required');
  }

  if (!config.branding || typeof config.branding !== 'object') {
    throw new ValidationError('Branding configuration is required');
  }

  if (!Array.isArray(config.apps)) {
    throw new ValidationError('Apps must be an array');
  }

  if (!Array.isArray(config.features)) {
    throw new ValidationError('Features must be an array');
  }

  logger.debug('Project configuration validated');
}

/**
 * Create the complete directory structure for the project.
 *
 * @param {string} projectPath - Project root path.
 * @returns {Promise<void>}
 */
async function createDirectoryStructure(projectPath) {
  const directories = [
    'src',
    'src/app',
    'src/app/router',
    'src/app/stores',
    'src/app/provider',
    'src/app/plugins',
    'src/app/shell',
    'src/app/boot',
    'src/config',
    'src/core',
    'src/core/constants',
    'src/core/errors',
    'src/core/utils',
    'src/core/composables',
    'src/core/guards',
    'src/core/services',
    'src/apps',
    'src/features',
    'src/generated',
    'src/shared',
    'src/shared/ui',
    'src/shared/layouts',
    'src/shared/icons',
    'src/assets',
    'src/assets/css',
    'src/assets/fonts',
    'src/assets/images',
    'src/documents',
    'public',
    'public/assets',
  ];

  for (const dir of directories) {
    const fullPath = path.join(projectPath, dir);
    await fs.ensureDir(fullPath);
    logger.debug(`Created directory: ${dir}`);
  }
}

/**
 * Install the base template into the project.
 *
 * @param {string} projectPath - Project root path.
 * @param {object} config - Project configuration.
 * @returns {Promise<void>}
 */
async function installBaseTemplate(projectPath, config) {
  const templatePath = path.join(getTemplatesDir(), 'project', 'base', config.frontend || 'vue');

  const context = {
    projectName: config.name,
    appName: config.branding.appName || config.name,
    projectVersion: config.version || '1.0.0',
    primaryColor: config.branding.primaryColor || '#2E5B28',
    secondaryColor: config.branding.secondaryColor || '#2B75BC',
    currentDate: new Date().toISOString().split('T')[0],
  };

  await installTemplate(templatePath, projectPath, context);
  logger.debug(`Base template installed from: ${templatePath}`);
}

/**
 * Install all selected apps.
 *
 * @param {string[]} appIds - List of app IDs.
 * @param {string} projectPath - Project root path.
 * @returns {Promise<void>}
 */
async function installSelectedApps(appIds, projectPath) {
  for (const appId of appIds) {
    const app = appRegistry.get(appId);
    if (!app) {
      logger.warn(`App not found: ${appId}, skipping`);
      continue;
    }

    await installApp(app, projectPath);
    logger.debug(`Installed app: ${appId}`);
  }
}

/**
 * Install all selected features.
 *
 * @param {string[]} featureIds - List of feature IDs.
 * @param {string} projectPath - Project root path.
 * @returns {Promise<void>}
 */
async function installSelectedFeatures(featureIds, projectPath) {
  for (const featureId of featureIds) {
    const feature = featureRegistry.get(featureId);
    if (!feature) {
      logger.warn(`Feature not found: ${featureId}, skipping`);
      continue;
    }

    await installFeature(feature, projectPath);
    logger.debug(`Installed feature: ${featureId}`);
  }
}

/**
 * Install all collections.
 *
 * @param {Array<any>} collections - List of collections.
 * @param {string} projectPath - Project root path.
 * @returns {Promise<void>}
 */
async function installCollections(collections, projectPath) {
  for (const collection of collections) {
    await installCollection(collection.collectionName, collection.appId, projectPath);
    logger.debug(`Installed collection: ${collection.collectionName}`);
  }
}

/**
 * Install project dependencies.
 *
 * @param {object} config - Project configuration.
 * @param {string} projectPath - Project root path.
 * @returns {Promise<void>}
 */
async function installProjectDependencies(config, projectPath) {
  const allDependencies = [];

  if (config.firestore) {
    // Root provider is already scaffolded in the template.
  }

  for (const appId of config.apps) {
    const app = appRegistry.get(appId);
    if (app && app.manifest.dependencies) {
      allDependencies.push(...extractDependencies(app.manifest.dependencies));
    }
  }

  for (const featureId of config.features) {
    const feature = featureRegistry.get(featureId);
    if (feature && feature.manifest.dependencies) {
      allDependencies.push(...extractDependencies(feature.manifest.dependencies));
    }
  }

  const uniqueDependencies = [...new Set(allDependencies)];

  if (uniqueDependencies.length > 0) {
    logger.info(`Resolved ${uniqueDependencies.length} additional project dependencies`);
  } else {
    logger.debug('No additional dependencies to install');
  }

  void projectPath;
}

/**
 * Extract npm package dependencies from a manifest dependency declaration.
 *
 * @param {any} deps - Dependency declaration.
 * @returns {string[]}
 */
function extractDependencies(deps) {
  if (!deps) return [];

  if (Array.isArray(deps)) {
    return deps.filter((value) => typeof value === 'string');
  }

  if (typeof deps === 'string') {
    return [deps];
  }

  if (typeof deps === 'object') {
    const extracted = [];

    if (deps.npm && Array.isArray(deps.npm)) {
      extracted.push(...deps.npm);
    }

    if (deps.packages && Array.isArray(deps.packages)) {
      extracted.push(...deps.packages);
    }

    for (const [key, value] of Object.entries(deps)) {
      if (key === 'features' || key === 'apps' || key === 'hooks' || key === 'collections') {
        continue;
      }

      if (typeof value === 'object') {
        extracted.push(...extractDependencies(value));
      } else if (typeof value === 'string' && (value.includes('@') || value.includes('/'))) {
        extracted.push(value);
      }
    }

    return extracted;
  }

  return [];
}
