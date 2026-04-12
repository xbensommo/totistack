/**
 * @file project-generator.js
 * @description Orchestrates generation of a new project using all core components.
 */

import path from 'path'
import fs from 'fs-extra'
import { installTemplate } from '../installer/template-installer.js'
import { installApp } from '../installer/app-installer.js'
import { installFeature } from '../installer/feature-installer.js'
import { installCollection } from '../installer/collection-installer.js'
import { generateConfig } from './config-generator.js'
import { generateDocumentation } from './document-generator.js'
import { generateAssemblyArtifacts } from './assembly-generator.js'
import { appRegistry, featureRegistry } from '../registry/index.js'
import { getTemplatesDir } from '../utils/path.js'
import { logger } from '../utils/logger.js'
import { InstallError, ValidationError } from '../errors/index.js'

const FEATURE_TOOLKIT_TEMPLATE = `/**
 * @file shared/featureToolkit.js
 * @description Shared runtime helpers for declarative Totistack feature modules.
 */

/**
 * Resolve collection actions from the root app store.
 *
 * @param {object} appStore
 * @param {string} collectionName
 * @returns {object}
 */
export function getCollectionActions(appStore, collectionName) {
  if (!appStore || !collectionName) {
    return {}
  }

  const directKey = \`${'${collectionName}'}Actions\`
  const direct = appStore[directKey]
  if (direct && typeof direct === 'object') {
    return direct
  }

  const generated = appStore.collectionsActions?.[collectionName]
  if (generated && typeof generated === 'object') {
    return generated
  }

  return {}
}

/**
 * Execute the first available action name from a list.
 *
 * @param {object} actions
 * @param {string[]} methodNames
 * @param {...any} args
 * @returns {Promise<any>}
 */
export async function runAction(actions, methodNames, ...args) {
  for (const methodName of methodNames) {
    if (typeof actions?.[methodName] === 'function') {
      return actions[methodName](...args)
    }
  }

  throw new Error(\`Required collection action is missing. Expected one of: \${methodNames.join(', ')}\`)
}

/**
 * Read collection items from the root store after a collection action updates state.
 *
 * @param {object} appStore
 * @param {string} collectionName
 * @returns {object[]}
 */
export function getCollectionItems(appStore, collectionName) {
  const stateSlice = appStore?.[collectionName]

  if (Array.isArray(stateSlice)) {
    return stateSlice
  }

  if (Array.isArray(stateSlice?.items)) {
    return stateSlice.items
  }

  if (Array.isArray(stateSlice?.value?.items)) {
    return stateSlice.value.items
  }

  if (Array.isArray(stateSlice?.value)) {
    return stateSlice.value
  }

  return []
}

/**
 * Fetch an initial page and return the normalized items list.
 *
 * @param {object} appStore
 * @param {string} collectionName
 * @param {object} options
 * @returns {Promise<object[]>}
 */
export async function fetchCollectionItems(appStore, collectionName, options = {}) {
  const actions = getCollectionActions(appStore, collectionName)
  if (typeof actions.fetchInitialPage === 'function') {
    await actions.fetchInitialPage(options)
  }
  return getCollectionItems(appStore, collectionName)
}

/**
 * Assert access when the root access layer is active.
 *
 * @param {object} access
 * @param {string|string[]} requirement
 * @param {string} fallbackMessage
 */
export function assertAccess(access, requirement, fallbackMessage = 'You are not allowed to perform this action.') {
  if (!requirement) return

  if (!access || access.enabled === false) {
    return
  }

  const allowed = typeof access.can === 'function'
    ? access.can(requirement)
    : true

  if (!allowed) {
    throw new Error(fallbackMessage)
  }
}

/**
 * Create a stable client-side identifier.
 *
 * @param {string} prefix
 * @returns {string}
 */
export function createId(prefix = 'item') {
  const safePrefix = String(prefix).trim() || 'item'
  if (globalThis.crypto?.randomUUID) {
    return \`${'${safePrefix}'}_\${globalThis.crypto.randomUUID()}\`
  }
  return \`${'${safePrefix}'}_\${Date.now()}_\${Math.random().toString(36).slice(2, 10)}\`
}

/**
 * Return a trimmed string slug.
 *
 * @param {string} value
 * @returns {string}
 */
export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Create a proxy that lazily resolves a feature service.
 * Useful for backward compatibility with older direct default imports.
 *
 * @param {() => object} resolver
 * @returns {object}
 */
export function createLegacyService(resolver) {
  return new Proxy({}, {
    get(_target, property) {
      const service = resolver()
      const value = service?.[property]
      if (typeof value === 'function') {
        return value.bind(service)
      }
      return value
    },
  })
}

/**
 * Normalize a thrown value into a regular Error instance.
 *
 * @param {unknown} error
 * @param {string} fallbackMessage
 * @returns {Error}
 */
export function normalizeError(error, fallbackMessage = 'An unexpected feature error occurred.') {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  const message = error && typeof error === 'object' && 'message' in error
    ? error.message
    : fallbackMessage

  return new Error(String(message))
}

export default {
  getCollectionActions,
  runAction,
  getCollectionItems,
  fetchCollectionItems,
  assertAccess,
  createId,
  slugify,
  createLegacyService,
  normalizeError,
}
`

/**
 * Generate a complete project from configuration.
 *
 * @param {object} config
 * @param {string} projectPath
 * @returns {Promise<void>}
 */
export async function generateProject(config, projectPath) {
  logger.info(`Starting project generation at: ${projectPath}`)

  validateProjectConfig(config)

  const fullProjectPath = path.join(projectPath, config.name)
  logger.debug(`Full project path: ${fullProjectPath}`)

  try {
    await createDirectoryStructure(fullProjectPath)
    logger.debug('Directory structure created')

    await installBaseTemplate(fullProjectPath, config)
    logger.debug('Base template installed')

    await ensureSharedFeatureToolkit(fullProjectPath)
    logger.debug('Shared feature toolkit ensured')

    await generateConfig(config, fullProjectPath)
    logger.debug('Configuration files generated')

    await installSelectedApps(config.apps, fullProjectPath)
    logger.debug(`Installed ${config.apps.length} apps`)

    await installSelectedFeatures(config.features, fullProjectPath)
    logger.debug(`Installed ${config.features.length} features`)

    await installCollections(config.collections || [], fullProjectPath)
    logger.debug(`Installed ${config.collections?.length || 0} collections`)

    await generateAssemblyArtifacts(fullProjectPath)
    logger.debug('Generated assembly artifacts')

    await generateDocumentation(config, fullProjectPath)
    logger.debug('Documentation generated')

    await installProjectDependencies(config, fullProjectPath)
    logger.debug('Dependencies installed')

    logger.info('Project generation completed successfully')
  } catch (error) {
    logger.error('Project generation failed:', error)

    try {
      await fs.remove(fullProjectPath)
      logger.info('Cleaned up partial project directory')
    } catch (cleanupError) {
      logger.warn('Failed to clean up project directory:', cleanupError)
    }

    if (error instanceof InstallError || error instanceof ValidationError) {
      throw error
    }

    throw new InstallError(`Project generation failed: ${error.message}`, { cause: error })
  }
}

/**
 * Validate project configuration.
 *
 * @param {object} config
 * @returns {void}
 */
function validateProjectConfig(config) {
  if (!config.name || typeof config.name !== 'string') {
    throw new ValidationError('Project name is required')
  }

  if (!config.branding || typeof config.branding !== 'object') {
    throw new ValidationError('Branding configuration is required')
  }

  if (!Array.isArray(config.apps)) {
    throw new ValidationError('Apps must be an array')
  }

  if (!Array.isArray(config.features)) {
    throw new ValidationError('Features must be an array')
  }

  logger.debug('Project configuration validated')
}

/**
 * Create the complete directory structure for the project.
 *
 * @param {string} projectPath
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
    'src/features/shared',
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
  ]

  for (const dir of directories) {
    const fullPath = path.join(projectPath, dir)
    await fs.ensureDir(fullPath)
    logger.debug(`Created directory: ${dir}`)
  }
}

/**
 * Install the base template into the project.
 *
 * @param {string} projectPath
 * @param {object} config
 * @returns {Promise<void>}
 */
async function installBaseTemplate(projectPath, config) {
  const templatePath = path.join(getTemplatesDir(), 'project', 'base', config.frontend || 'vue')

  const context = {
    projectName: config.name,
    appName: config.branding.appName || config.name,
    projectVersion: config.version || '1.0.0',
    primaryColor: config.branding.primaryColor || '#2E5B28',
    secondaryColor: config.branding.secondaryColor || '#2B75BC',
    currentDate: new Date().toISOString().split('T')[0],
  }

  await installTemplate(templatePath, projectPath, context)
  logger.debug(`Base template installed from: ${templatePath}`)
}

/**
 * Ensure the shared feature toolkit exists for feature services that import
 * ../../shared/featureToolkit.js from inside src/features/services.
 *
 * @param {string} projectPath
 * @returns {Promise<void>}
 */
async function ensureSharedFeatureToolkit(projectPath) {
  const toolkitPath = path.join(projectPath, 'src', 'features', 'shared', 'featureToolkit.js')

  if (await fs.pathExists(toolkitPath)) {
    logger.debug('Shared feature toolkit already exists, skipping scaffold')
    return
  }

  await fs.ensureDir(path.dirname(toolkitPath))
  await fs.writeFile(toolkitPath, FEATURE_TOOLKIT_TEMPLATE, 'utf8')
  logger.debug(`Scaffolded shared feature toolkit: ${toolkitPath}`)
}

/**
 * Install all selected apps.
 *
 * @param {string[]} appIds
 * @param {string} projectPath
 * @returns {Promise<void>}
 */
async function installSelectedApps(appIds, projectPath) {
  for (const appId of appIds) {
    const app = appRegistry.get(appId)
    if (!app) {
      logger.warn(`App not found: ${appId}, skipping`)
      continue
    }

    await installApp(app, projectPath)
    logger.debug(`Installed app: ${appId}`)
  }
}

/**
 * Install all selected features.
 *
 * @param {string[]} featureIds
 * @param {string} projectPath
 * @returns {Promise<void>}
 */
async function installSelectedFeatures(featureIds, projectPath) {
  for (const featureId of featureIds) {
    const feature = featureRegistry.get(featureId)
    if (!feature) {
      logger.warn(`Feature not found: ${featureId}, skipping`)
      continue
    }

    await installFeature(feature, projectPath)
    logger.debug(`Installed feature: ${featureId}`)
  }
}

/**
 * Install all collections.
 *
 * @param {Array<any>} collections
 * @param {string} projectPath
 * @returns {Promise<void>}
 */
async function installCollections(collections, projectPath) {
  for (const collection of collections) {
    await installCollection(collection.collectionName, collection.appId, projectPath)
    logger.debug(`Installed collection: ${collection.collectionName}`)
  }
}

/**
 * Install project dependencies.
 *
 * @param {object} config
 * @param {string} projectPath
 * @returns {Promise<void>}
 */
async function installProjectDependencies(config, projectPath) {
  const allDependencies = []

  if (config.firestore) {
    // Root provider is already scaffolded in the template.
  }

  for (const appId of config.apps) {
    const app = appRegistry.get(appId)
    if (app && app.manifest.dependencies) {
      allDependencies.push(...extractDependencies(app.manifest.dependencies))
    }
  }

  for (const featureId of config.features) {
    const feature = featureRegistry.get(featureId)
    if (feature && feature.manifest.dependencies) {
      allDependencies.push(...extractDependencies(feature.manifest.dependencies))
    }
  }

  const uniqueDependencies = [...new Set(allDependencies)]

  if (uniqueDependencies.length > 0) {
    logger.info(`Resolved ${uniqueDependencies.length} additional project dependencies`)
  } else {
    logger.debug('No additional dependencies to install')
  }

  void projectPath
}

/**
 * Extract npm package dependencies from a manifest dependency declaration.
 *
 * @param {any} deps
 * @returns {string[]}
 */
function extractDependencies(deps) {
  if (!deps) return []

  if (Array.isArray(deps)) {
    return deps.filter((value) => typeof value === 'string')
  }

  if (typeof deps === 'string') {
    return [deps]
  }

  if (typeof deps === 'object') {
    const extracted = []

    if (deps.npm && Array.isArray(deps.npm)) {
      extracted.push(...deps.npm)
    }

    if (deps.packages && Array.isArray(deps.packages)) {
      extracted.push(...deps.packages)
    }

    for (const [key, value] of Object.entries(deps)) {
      if (key === 'features' || key === 'apps' || key === 'hooks' || key === 'collections') {
        continue
      }

      if (typeof value === 'object') {
        extracted.push(...extractDependencies(value))
      } else if (typeof value === 'string' && (value.includes('@') || value.includes('/'))) {
        extracted.push(value)
      }
    }

    return extracted
  }

  return []
}
