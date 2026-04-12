/**
 * @file assembly-generator.js
 * @description Generates the build-time assembly layer under src/generated.
 *
 * The generated directory is the single runtime assembly point. Apps and
 * features remain declarative and the root project consumes only generated
 * registries for collections, routes, services, and installed module metadata.
 */

import path from 'path';
import { writeFile } from '../utils/file.js';
import { logger } from '../utils/logger.js';
import { InstallError } from '../errors/index.js';

/**
 * Generate all assembly artifacts for a project.
 *
 * @param {string} projectRoot
 * @returns {Promise<void>}
 */
export async function generateAssemblyArtifacts(projectRoot) {
  const generatedDir = path.join(projectRoot, 'src', 'generated');

  try {
    await Promise.all([
      writeFile(path.join(generatedDir, 'collections.js'), buildCollectionsRegistry()),
      writeFile(path.join(generatedDir, 'routes.js'), buildRoutesRegistry()),
      writeFile(path.join(generatedDir, 'services.js'), buildServicesRegistry()),
      writeFile(path.join(generatedDir, 'modules.js'), buildModulesRegistry()),
      writeFile(path.join(generatedDir, 'index.js'), buildIndexRegistry()),
    ]);

    logger.info('Generated build-time assembly artifacts in src/generated');
  } catch (error) {
    throw new InstallError(`Failed to generate assembly artifacts: ${error.message}`, {
      cause: error,
    });
  }
}

/**
 * Build the generated collections registry file.
 *
 * @returns {string}
 */
function buildCollectionsRegistry() {
  return `/**
 * @file src/generated/collections.js
 * @description Build-time collection assembly for installed apps and features.
 */

const collectionModuleImports = import.meta.glob(
  [
    '../apps/*/collections/**/*.js',
    '../features/*/collections/**/*.js',
    '!../apps/*/collections/**/*.test.js',
    '!../apps/*/collections/**/*.spec.js',
    '!../features/*/collections/**/*.test.js',
    '!../features/*/collections/**/*.spec.js',
  ],
  { eager: true },
)

const manifestImports = import.meta.glob(
  ['../apps/*/app.manifest.js', '../features/*/feature.manifest.js'],
  { eager: true },
)

function isCollectionDefinition(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.name === 'string' &&
      value.name.trim().length > 0,
  )
}

function extractDefinitionsFromModule(modulePath, mod) {
  const extracted = []

  if (isCollectionDefinition(mod?.default)) {
    extracted.push(mod.default)
  } else if (mod?.default && typeof mod.default === 'object') {
    for (const value of Object.values(mod.default)) {
      if (isCollectionDefinition(value)) {
        extracted.push(value)
      }
    }
  }

  for (const [exportName, value] of Object.entries(mod)) {
    if (exportName === 'default') continue

    if (isCollectionDefinition(value)) {
      extracted.push(value)
    } else if (value && typeof value === 'object') {
      for (const nestedValue of Object.values(value)) {
        if (isCollectionDefinition(nestedValue)) {
          extracted.push(nestedValue)
        }
      }
    }
  }

  return extracted
}

function extractManifestCollectionNames(manifest) {
  const collections = Array.isArray(manifest?.collections) ? manifest.collections : []

  return collections
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim()
      if (entry && typeof entry === 'object' && typeof entry.name === 'string') {
        return entry.name.trim()
      }
      return null
    })
    .filter(Boolean)
}

function buildCollectionRegistry() {
  const definitions = []
  const definitionNames = new Map()
  const declaredNames = new Set()

  for (const [modulePath, mod] of Object.entries(collectionModuleImports)) {
    const extracted = extractDefinitionsFromModule(modulePath, mod)

    for (const definition of extracted) {
      const normalizedName = definition.name.trim()

      if (definitionNames.has(normalizedName)) {
        throw new Error(
          '[generated/collections] Duplicate collection definition "' +
            normalizedName +
            '" found in "' +
            modulePath +
            '" and "' +
            definitionNames.get(normalizedName) +
            '".',
        )
      }

      definitionNames.set(normalizedName, modulePath)
      definitions.push(definition)
      declaredNames.add(normalizedName)
    }
  }

  for (const mod of Object.values(manifestImports)) {
    const manifest = mod?.default || mod
    for (const name of extractManifestCollectionNames(manifest)) {
      declaredNames.add(name)
    }
  }

  definitions.sort((a, b) => a.name.localeCompare(b.name))

  return {
    definitions,
    names: Array.from(declaredNames).sort((a, b) => a.localeCompare(b)),
  }
}

const registry = buildCollectionRegistry()

export const definedCollections = registry.definitions
export const generatedCollectionNames = registry.names

export function hasGeneratedCollection(collectionName) {
  return generatedCollectionNames.includes(collectionName)
}

export default definedCollections
`
}

/**
 * Build the generated routes registry file.
 *
 * @returns {string}
 */
function buildRoutesRegistry() {
  return `/**
 * @file src/generated/routes.js
 * @description Build-time route assembly for installed apps and features.
 */

const routeModuleImports = import.meta.glob(
  [
    '../apps/*/routes.js',
    '../apps/*/routes/index.js',
    '../features/*/routes.js',
    '../features/*/routes/index.js',
  ],
  { eager: true },
)

const manifestImports = import.meta.glob(
  ['../apps/*/app.manifest.js', '../features/*/feature.manifest.js'],
  { eager: true },
)

function normalizeRouteContribution(contribution, context = {}) {
  if (!contribution) return []

  const resolved = typeof contribution === 'function' ? contribution(context) : contribution

  if (Array.isArray(resolved)) return resolved.filter(Boolean)
  if (resolved && typeof resolved === 'object' && typeof resolved.path === 'string') {
    return [resolved]
  }

  return []
}

function extractRoutesFromModule(mod, context = {}) {
  const routes = []

  if (mod?.default) {
    routes.push(...normalizeRouteContribution(mod.default, context))
  }

  if (mod?.routes) {
    routes.push(...normalizeRouteContribution(mod.routes, context))
  }

  for (const [exportName, value] of Object.entries(mod)) {
    if (exportName === 'default' || exportName === 'routes') continue
    routes.push(...normalizeRouteContribution(value, context))
  }

  return routes
}

function extractManifestRoutes(manifest) {
  const routes = Array.isArray(manifest?.routes) ? manifest.routes : []
  return routes.filter((route) => route && typeof route.path === 'string')
}

export function createGeneratedRoutes(context = {}) {
  const routes = []
  const seenKeys = new Set()

  for (const mod of Object.values(routeModuleImports)) {
    routes.push(...extractRoutesFromModule(mod, context))
  }

  for (const mod of Object.values(manifestImports)) {
    const manifest = mod?.default || mod
    routes.push(...extractManifestRoutes(manifest))
  }

  return routes.filter((route) => {
    const key = route.name || route.path
    if (!key) return false
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })
}
`
}

/**
 * Build the generated services registry file.
 *
 * @returns {string}
 */
function buildServicesRegistry() {
  return String.raw`/**
 * @file src/generated/services.js
 * @description Build-time service assembly for installed apps and features.
 */

const serviceModuleImports = import.meta.glob(
  [
    '../apps/*/services/**/*.js',
    '../features/*/services/**/*.js',
    '!../apps/*/services/**/*.test.js',
    '!../apps/*/services/**/*.spec.js',
    '!../features/*/services/**/*.test.js',
    '!../features/*/services/**/*.spec.js',
  ],
  { eager: true },
)

/**
 * Convert a discovered module path into a stable registry key.
 *
 * Examples:
 * - ../apps/booking/services/bookingService.js -> booking:bookingService
 * - ../features/search/services/search/searchService.js -> search:search.searchService
 *
 * @param {string} modulePath
 * @returns {string}
 */
function toServiceKey(modulePath) {
  return modulePath
    .replace(/^\.\.\//, '')
    .replace(/^apps\//, '')
    .replace(/^features\//, '')
    .replace(/\/services\//, ':')
    .replace(/\.js$/, '')
    .replace(/\//g, '.')
}

/**
 * Create the generated service registry.
 *
 * @returns {Record<string, any>}
 */
export function createGeneratedServiceRegistry() {
  const registry = {}
  const entries = Object.entries(serviceModuleImports).sort(([leftPath], [rightPath]) =>
    leftPath.localeCompare(rightPath),
  )

  for (const [modulePath, mod] of entries) {
    const serviceKey = toServiceKey(modulePath)
    registry[serviceKey] = mod?.default || mod
  }

  return registry
}

export const generatedServices = createGeneratedServiceRegistry()

/**
 * Read a generated service by exact registry key.
 *
 * @param {string} serviceKey
 * @returns {any | null}
 */
export function getGeneratedService(serviceKey) {
  return generatedServices[serviceKey] || null
}

/**
 * Read a generated service by trailing key match.
 *
 * @param {string} serviceKeySuffix
 * @returns {any | null}
 */
export function getGeneratedServiceBySuffix(serviceKeySuffix) {
  const match = Object.entries(generatedServices).find(([serviceKey]) =>
    serviceKey.endsWith(serviceKeySuffix),
  )

  return match?.[1] || null
}

export default generatedServices
`
}

/**
 * Build the generated modules registry file.
 *
 * @returns {string}
 */
function buildModulesRegistry() {
  return `/**
 * @file src/generated/modules.js
 * @description Build-time module metadata assembly.
 */

const appManifestImports = import.meta.glob('../apps/*/app.manifest.js', { eager: true })
const featureManifestImports = import.meta.glob('../features/*/feature.manifest.js', { eager: true })

function normalizeManifestMetadata(mod, kind) {
  const manifest = mod?.default || mod || {}

  return {
    kind,
    id: manifest.id || null,
    name: manifest.name || manifest.id || null,
    version: manifest.version || '1.0.0',
    description: manifest.description || '',
    dependencies: manifest.dependencies || {},
    navigation: manifest.navigation || null,
  }
}

export const installedApps = Object.values(appManifestImports)
  .map((mod) => normalizeManifestMetadata(mod, 'app'))
  .filter((item) => item.id)
  .sort((a, b) => a.id.localeCompare(b.id))

export const installedFeatures = Object.values(featureManifestImports)
  .map((mod) => normalizeManifestMetadata(mod, 'feature'))
  .filter((item) => item.id)
  .sort((a, b) => a.id.localeCompare(b.id))

export const installedModules = [...installedApps, ...installedFeatures]
  .sort((a, b) => a.id.localeCompare(b.id))

export default installedModules
`
}

/**
 * Build the generated barrel file.
 *
 * @returns {string}
 */
function buildIndexRegistry() {
  return `/**
 * @file src/generated/index.js
 * @description Barrel exports for the generated assembly layer.
 */

export * from './collections.js'
export * from './modules.js'
export * from './routes.js'
export * from './services.js'
`
}
