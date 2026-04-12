/**
 * @file dependency-resolver.js
 * @description Resolves app and feature dependencies for Totistack project assembly.
 */

import { ResolveError } from '../errors/index.js'
import { logger } from '../utils/index.js'

/**
 * Normalize a dependency declaration into explicit app and feature arrays.
 *
 * Supported legacy and current shapes:
 * - manifest.features
 * - manifest.requiresApps
 * - manifest.dependencies.features
 * - manifest.dependencies.apps
 *
 * @param {object | undefined | null} manifest
 * @returns {{ apps: string[], features: string[] }}
 */
function normalizeManifestDependencies(manifest) {
  const normalized = {
    apps: new Set(),
    features: new Set(),
  }

  if (!manifest || typeof manifest !== 'object') {
    return {
      apps: [],
      features: [],
    }
  }

  const dependencies = manifest.dependencies && typeof manifest.dependencies === 'object'
    ? manifest.dependencies
    : {}

  const appDependencies = [
    ...(Array.isArray(dependencies.apps) ? dependencies.apps : []),
    ...(Array.isArray(manifest.requiresApps) ? manifest.requiresApps : []),
  ]

  const featureDependencies = [
    ...(Array.isArray(dependencies.features) ? dependencies.features : []),
    ...(Array.isArray(manifest.features) ? manifest.features : []),
    ...(Array.isArray(manifest.requiresFeatures) ? manifest.requiresFeatures : []),
  ]

  for (const appId of appDependencies) {
    if (typeof appId === 'string' && appId.trim()) {
      normalized.apps.add(appId.trim())
    }
  }

  for (const featureId of featureDependencies) {
    if (typeof featureId === 'string' && featureId.trim()) {
      normalized.features.add(featureId.trim())
    }
  }

  return {
    apps: [...normalized.apps],
    features: [...normalized.features],
  }
}

/**
 * Resolve all dependencies for a set of selected apps and features.
 *
 * The resolver expands transitive dependencies until no new items are added.
 * Missing dependencies are logged and skipped so generation can continue when
 * a manifest references an optional or not-yet-installed module.
 *
 * @param {string[]} selectedApps
 * @param {string[]} selectedFeatures
 * @param {{ get(id: string): any, getAll(): Array<{ id: string }>, has?: (id: string) => boolean }} appRegistry
 * @param {{ get(id: string): any, getAll(): Array<{ id: string }>, has?: (id: string) => boolean }} featureRegistry
 * @returns {{ apps: string[], features: string[] }}
 * @throws {ResolveError}
 */
export function resolveDependencies(selectedApps, selectedFeatures, appRegistry, featureRegistry) {
  const resolvedApps = new Set(Array.isArray(selectedApps) ? selectedApps : [])
  const resolvedFeatures = new Set(Array.isArray(selectedFeatures) ? selectedFeatures : [])
  let changed = false
  let iteration = 0
  const maxIterations = 100

  logger.debug(
    `Resolving dependencies for apps: [${[...resolvedApps].join(', ')}], features: [${[...resolvedFeatures].join(', ')}]`,
  )

  do {
    changed = false
    iteration += 1

    if (iteration > maxIterations) {
      throw new ResolveError(
        `Dependency resolution exceeded max iterations (${maxIterations}). Possible circular dependency.`,
      )
    }

    for (const appId of [...resolvedApps]) {
      const app = appRegistry.get(appId)

      if (!app) {
        const availableApps = appRegistry.getAll().map((entry) => entry.id)
        logger.error(`App '${appId}' not found. Available apps: ${availableApps.join(', ') || 'none'}`)
        throw new ResolveError(`App not found: ${appId}. Available apps: ${availableApps.join(', ') || 'none'}`)
      }

      const dependencies = normalizeManifestDependencies(app.manifest)

      for (const requiredAppId of dependencies.apps) {
        if (!appRegistry.get(requiredAppId)) {
          const availableApps = appRegistry.getAll().map((entry) => entry.id)
          logger.warn(
            `App '${requiredAppId}' required by app '${appId}' not found. Available apps: ${availableApps.join(', ') || 'none'}`,
          )
          continue
        }

        if (!resolvedApps.has(requiredAppId)) {
          resolvedApps.add(requiredAppId)
          changed = true
          logger.debug(`Added app ${requiredAppId} required by app ${appId}`)
        }
      }

      for (const requiredFeatureId of dependencies.features) {
        if (!featureRegistry.get(requiredFeatureId)) {
          const availableFeatures = featureRegistry.getAll().map((entry) => entry.id)
          logger.warn(
            `Feature '${requiredFeatureId}' required by app '${appId}' not found. Available features: ${availableFeatures.join(', ') || 'none'}`,
          )
          continue
        }

        if (!resolvedFeatures.has(requiredFeatureId)) {
          resolvedFeatures.add(requiredFeatureId)
          changed = true
          logger.debug(`Added feature ${requiredFeatureId} required by app ${appId}`)
        }
      }
    }

    for (const featureId of [...resolvedFeatures]) {
      const feature = featureRegistry.get(featureId)

      if (!feature) {
        const availableFeatures = featureRegistry.getAll().map((entry) => entry.id)
        logger.warn(
          `Feature '${featureId}' not found during dependency resolution. Available features: ${availableFeatures.join(', ') || 'none'}`,
        )
        continue
      }

      const dependencies = normalizeManifestDependencies(feature.manifest)

      for (const requiredAppId of dependencies.apps) {
        if (!appRegistry.get(requiredAppId)) {
          const availableApps = appRegistry.getAll().map((entry) => entry.id)
          logger.warn(
            `App '${requiredAppId}' required by feature '${featureId}' not found. Available apps: ${availableApps.join(', ') || 'none'}`,
          )
          continue
        }

        if (!resolvedApps.has(requiredAppId)) {
          resolvedApps.add(requiredAppId)
          changed = true
          logger.debug(`Added app ${requiredAppId} required by feature ${featureId}`)
        }
      }

      for (const requiredFeatureId of dependencies.features) {
        if (!featureRegistry.get(requiredFeatureId)) {
          const availableFeatures = featureRegistry.getAll().map((entry) => entry.id)
          logger.warn(
            `Feature '${requiredFeatureId}' required by feature '${featureId}' not found. Available features: ${availableFeatures.join(', ') || 'none'}`,
          )
          continue
        }

        if (!resolvedFeatures.has(requiredFeatureId)) {
          resolvedFeatures.add(requiredFeatureId)
          changed = true
          logger.debug(`Added feature ${requiredFeatureId} required by feature ${featureId}`)
        }
      }
    }
  } while (changed)

  const result = {
    apps: [...resolvedApps],
    features: [...resolvedFeatures],
  }

  logger.debug(`Dependency resolution complete: ${result.apps.length} apps, ${result.features.length} features`)

  return result
}

/**
 * Validate that all resolved apps and features exist in the registries.
 *
 * @param {string[]} appIds
 * @param {string[]} featureIds
 * @param {{ has?: (id: string) => boolean, get?: (id: string) => any }} appRegistry
 * @param {{ has?: (id: string) => boolean, get?: (id: string) => any }} featureRegistry
 * @returns {boolean}
 * @throws {ResolveError}
 */
export function validateDependencies(appIds, featureIds, appRegistry, featureRegistry) {
  const missingApps = []
  const missingFeatures = []

  for (const appId of appIds) {
    const exists = typeof appRegistry.has === 'function' ? appRegistry.has(appId) : Boolean(appRegistry.get?.(appId))
    if (!exists) {
      missingApps.push(appId)
    }
  }

  for (const featureId of featureIds) {
    const exists = typeof featureRegistry.has === 'function'
      ? featureRegistry.has(featureId)
      : Boolean(featureRegistry.get?.(featureId))

    if (!exists) {
      missingFeatures.push(featureId)
    }
  }

  if (missingApps.length > 0 || missingFeatures.length > 0) {
    throw new ResolveError(
      `Missing dependencies: ${missingApps.length > 0 ? `Apps: ${missingApps.join(', ')}` : ''}${missingApps.length > 0 && missingFeatures.length > 0 ? '; ' : ''}${missingFeatures.length > 0 ? `Features: ${missingFeatures.join(', ')}` : ''}`,
    )
  }

  return true
}

export { normalizeManifestDependencies }
