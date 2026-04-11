/**
 * @file config-generator.js
 * @description Generates configuration files from templates.
 *
 * This generator keeps project configuration declarative and writes all root
 * configuration files into src/config so the runtime can stay small.
 */

import path from 'path';
import fs from 'fs-extra';
import { installTemplateFile } from '../installer/template-installer.js';
import { logger } from '../utils/logger.js';

/**
 * Generate all configuration files for the project.
 *
 * @param {object} config
 * @param {string} projectRoot
 * @returns {Promise<void>}
 */
export async function generateConfig(config, projectRoot) {
  const configDir = path.join(projectRoot, 'src', 'config');
  await fs.ensureDir(configDir);

  const selectedFeatures = Array.isArray(config.features) ? config.features : [];
  const hasAuthFeature = selectedFeatures.includes('auth');
  const hasRbacFeature = selectedFeatures.includes('rbac');

  const context = {
    projectName: config.name,
    appName: config.branding.appName || config.name,
    appShortName: config.branding.appShortName || config.name.substring(0, 15),
    appDescription: config.branding.description || 'Generated with Totistack v2',
    primaryColor: config.branding.primaryColor || '#2E5B28',
    secondaryColor: config.branding.secondaryColor || '#2B75BC',
    accentColor: config.branding.accentColor || '#8BC53F',
    fontSans: config.branding.fontSans || 'Inter, sans-serif',
    fontSerif: config.branding.fontSerif || 'Georgia, serif',
    frontend: config.frontend,
    packageManager: config.packageManager,
    appsList: JSON.stringify(config.apps, null, 2),
    featuresList: JSON.stringify(selectedFeatures, null, 2),
    firebaseProjectId: config.firestore?.firebaseProjectId || 'your-project-id',
    firebaseApiKey: config.firestore?.firebaseApiKey || 'your-api-key',
    firebaseAppId: config.firestore?.firebaseAppId || 'your-app-id',
    firebaseMessagingSenderId: config.firestore?.firebaseMessagingSenderId || 'your-sender-id',
    twitterHandle: config.branding.twitterHandle || '',
    githubRepo: config.branding.githubRepo || '',
    websiteUrl: config.branding.websiteUrl || '',
    currentYear: new Date().getFullYear(),
    authEnabled: JSON.stringify(hasAuthFeature),
    rbacEnabled: JSON.stringify(hasRbacFeature),
  };

  const configFiles = [
    { template: 'config/project.config.js.tpl', dest: 'project.config.js' },
    { template: 'config/branding.config.js.tpl', dest: 'branding.config.js' },
    { template: 'config/apps.config.js.tpl', dest: 'apps.config.js' },
    { template: 'config/features.config.js.tpl', dest: 'features.config.js' },
    { template: 'config/collections.config.js.tpl', dest: 'collections.config.js' },
    { template: 'config/access.config.js.tpl', dest: 'access.config.js' },
  ];

  for (const file of configFiles) {
    const destPath = path.join(configDir, file.dest);

    if (await fs.pathExists(destPath)) {
      const backupPath = `${destPath}.backup`;
      await fs.copy(destPath, backupPath);
      logger.debug(`Backed up existing config: ${file.dest}`);
    }

    await installTemplateFile(file.template, destPath, context);
    logger.debug(`Generated config: ${file.dest}`);
  }

  logger.info(`Generated ${configFiles.length} configuration files`);
}
