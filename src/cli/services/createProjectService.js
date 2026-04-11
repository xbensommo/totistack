/**
 * @file createProjectService.js
 * @description Orchestrates project creation using core generators
 * @date 2026-03-22
 * @author Totistack Team
 * @changes
 * - COMPLETE REWRITE: Now delegates to core generators instead of direct file operations
 * - Added registry resolution for apps and features
 * - Implemented proper interactive/non-interactive mode detection
 * - Added collection resolution from selected apps
 * - Integrated with core project generator
 */

import ora from 'ora';
import chalk from 'chalk';
import { generateProject } from '../../core/generators/project-generator.js';
import { appRegistry, featureRegistry, presetRegistry } from '../../core/registry/index.js';
import { resolvePreset } from '../../core/resolver/preset-resolver.js';
import { resolveDependencies } from '../../core/resolver/dependency-resolver.js';
import { resolveCollections } from '../../core/resolver/collection-resolver.js';
import { promptProjectDetails } from '../prompts/projectPrompts.js';
import { promptBranding } from '../prompts/brandingPrompts.js';
import { promptApps } from '../prompts/appPrompts.js';
import { promptFeatures } from '../prompts/featurePrompts.js';
import { promptFirestore } from '../prompts/firestorePrompts.js';
import { logger } from '../../core/utils/logger.js';
import { ValidationError } from '../../core/errors/index.js';

/**
 * Main service for creating a new Totistack project
 * @async
 * @param {string} projectName - Name of the project folder
 * @param {object} options - CLI options
 * @param {string} [options.preset] - Preset ID to use
 * @param {boolean} [options.interactive] - Force interactive mode
 * @param {string} [options.packageManager] - Package manager to use
 * @param {string} [options.frontend] - Frontend framework
 * @returns {Promise<void>}
 * @throws {ValidationError} If configuration is invalid
 */
export async function createProjectService(projectName, options) {
  const isInteractive = !options.preset && options.interactive !== false;
  
  logger.info(`Creating project: ${projectName} (interactive: ${isInteractive})`);
  
  const spinner = ora('Setting up your project...').start();

  try {
    // Phase 1: Collect configuration
    const config = await collectProjectConfiguration(projectName, options, isInteractive, spinner);
    
    // Phase 2: Resolve modules from preset if provided
    const resolvedModules = await resolveModulesFromPreset(config.preset, spinner);
    
    // Phase 3: Resolve app and feature selections
    const selections = await resolveModuleSelections(config, resolvedModules, isInteractive, spinner);
    
    // Phase 4: Resolve dependencies and collections
    const { apps, features } = resolveDependencies(
      selections.apps,
      selections.features,
      appRegistry,
      featureRegistry
    );

    console.clear(); logger.info(apps, features)
    
    logger.debug(`Resolved dependencies - Apps: ${apps.join(', ')}, Features: ${features.join(', ')}`);
    
    const collections = resolveCollections(apps, appRegistry);
    logger.debug(`Resolved collections: ${collections.map(c => c.collectionName).join(', ')}`);
    
    // Phase 5: Prepare complete project configuration
    const projectConfig = {
      name: config.projectName,
      packageManager: config.packageManager,
      frontend: config.frontend,
      branding: config.branding,
      apps: apps,
      features: features,
      collections,
      firestore: config.firestoreConfig,
    };
    
    // Phase 6: Generate project using core generator
    spinner.text = 'Generating project files...';
    const projectPath = process.cwd();
    
    await generateProject(projectConfig, projectPath);
    
    spinner.succeed(chalk.green(`\n✅ Project ${config.projectName} created successfully!`));
    
    // Phase 7: Post-installation hints
    await publishPostInstallHints(config.projectName, config.packageManager);
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    logger.error('Project creation failed:', error);
    
    if (error instanceof ValidationError) {
      console.error(chalk.red(`\nValidation Error: ${error.message}`));
    } else {
      console.error(chalk.red(`\nError: ${error.message}`));
    }
    
    throw error;
  }
}

/**
 * Collect project configuration from user input or defaults
 * @private
 * @async
 * @param {string} projectName - Project name
 * @param {object} options - CLI options
 * @param {boolean} isInteractive - Whether in interactive mode
 * @param {object} spinner - Ora spinner instance
 * @returns {Promise<object>} Project configuration
 */
async function collectProjectConfiguration(projectName, options, isInteractive, spinner) {
  let answers;
  
  if (!isInteractive) {
    // Non-interactive: use defaults or provided options
    answers = {
      projectName,
      preset: options.preset || 'custom',
      packageManager: options.packageManager || 'npm',
      frontend: options.frontend || 'vue',
      useFirestore: options.useFirestore !== false,
    };
    logger.info('Using non-interactive configuration');
  } else {
    // Interactive: prompt user
    spinner.stop();
    answers = await promptProjectDetails(projectName);
    spinner.start();
    logger.info('Interactive configuration collected');
  }
  
  // Collect branding (interactive only uses defaults for non-interactive)
  let branding;
  let firestoreConfig = null;
  
  if (isInteractive) {
    spinner.stop();
    branding = await promptBranding();
    spinner.start();
    logger.debug('Branding configuration collected');
    
    if (answers.useFirestore) {
      spinner.stop();
      firestoreConfig = await promptFirestore();
      spinner.start();
      logger.debug('Firestore configuration collected');
    }
  } else {
    // Default branding
    branding = {
      appName: projectName,
      primaryColor: '#2E5B28',
      secondaryColor: '#2B75BC',
      accentColor: '#8BC53F',
      fontSans: 'Inter, sans-serif',
      fontSerif: 'Georgia, serif',
    };
    logger.debug('Using default branding');
    
    if (answers.useFirestore) {
      firestoreConfig = {
        firebaseProjectId: 'your-project-id',
        firestoreCollectionPrefix: '',
      };
      logger.debug('Using default Firestore configuration');
    }
  }
  
  return {
    projectName: answers.projectName,
    preset: answers.preset,
    packageManager: answers.packageManager,
    frontend: answers.frontend,
    branding,
    firestoreConfig,
  };
}

/**
 * Resolve modules from preset
 * @private
 * @async
 * @param {string} presetId - Preset identifier
 * @param {object} spinner - Ora spinner instance
 * @returns {Promise<{apps: string[], features: string[]}>}
 */
async function resolveModulesFromPreset(presetId, spinner) {
  if (presetId === 'custom') {
    return { apps: [], features: [] };
  }
  
  spinner.text = `Resolving preset: ${presetId}...`;
  
  try {
    const { apps, features } = resolvePreset(presetId, presetRegistry);
    logger.info(`Preset ${presetId} resolved: ${apps.length} apps, ${features.length} features`);
    return { apps, features };
  } catch (error) {
    logger.error(`Failed to resolve preset ${presetId}:`, error);
    throw new ValidationError(`Preset '${presetId}' not found`, { cause: error });
  }
}

/**
 * Resolve module selections from user input
 * @private
 * @async
 * @param {object} config - Base configuration
 * @param {object} presetModules - Modules from preset
 * @param {boolean} isInteractive - Whether in interactive mode
 * @param {object} spinner - Ora spinner instance
 * @returns {Promise<{apps: string[], features: string[]}>}
 */
async function resolveModuleSelections(config, presetModules, isInteractive, spinner) {
  let selectedApps = presetModules.apps;
  let selectedFeatures = presetModules.features;
  
  // Only prompt for custom preset in interactive mode
  if (config.preset === 'custom' && isInteractive) {
    spinner.stop();
    
    // Get available apps from registry
    const availableApps = appRegistry.getAll().map(app => ({
      id: app.id,
      name: app.manifest.name,
      description: app.manifest.description,
    }));
    
    if (availableApps.length > 0) {
      selectedApps = await promptApps(availableApps);
      logger.debug(`User selected apps: ${selectedApps.join(', ')}`);
    }
    
    // Get available features from registry
    const availableFeatures = featureRegistry.getAll().map(feature => ({
      id: feature.id,
      name: feature.manifest.name,
      description: feature.manifest.description,
    }));
    
    if (availableFeatures.length > 0) {
      selectedFeatures = await promptFeatures(availableFeatures);
      logger.debug(`User selected features: ${selectedFeatures.join(', ')}`);
    }
    
    spinner.start();
  } else if (config.preset === 'custom' && !isInteractive) {
    // Non-interactive custom preset - use empty arrays
    selectedApps = [];
    selectedFeatures = [];
    logger.debug('Non-interactive custom preset: no modules selected');
  } else {
    logger.debug(`Using preset modules: ${selectedApps.length} apps, ${selectedFeatures.length} features`);
  }
  
  return { apps: selectedApps, features: selectedFeatures };
}

/**
 * Display post-installation hints
 * @private
 * @async
 * @param {string} projectName - Project name
 * @param {string} packageManager - Package manager used
 * @returns {Promise<void>}
 */
async function publishPostInstallHints(projectName, packageManager) {
  const installCmd = packageManager === 'npm' ? 'npm install' : 
                     packageManager === 'yarn' ? 'yarn' : 'pnpm install';
  const devCmd = packageManager === 'npm' ? 'npm run dev' : 
                 packageManager === 'yarn' ? 'yarn dev' : 'pnpm dev';
  
  console.log(chalk.green('\n📋 Next steps:'));
  console.log(chalk.white(`   cd ${projectName}`));
  console.log(chalk.white(`   ${installCmd}  # Install dependencies`));
  console.log(chalk.white(`   ${devCmd}      # Start development server`));
  console.log(chalk.blue('\n📚 Documentation: https://docs.totistack.dev'));
  console.log(chalk.blue('💬 Need help? Join our Discord: https://discord.gg/totistack\n'));
}