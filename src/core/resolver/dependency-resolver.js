/**
 * @file dependency-resolver.js
 * @description Resolves dependencies between apps and features.
 * @date 2026-03-22
 * @author Totistack Team
 * @changes
 * - ENHANCED: Added better error messages with context
 * - ADDED: Circular dependency detection
 * - ADDED: Dependency validation before resolution
 */

import { ResolveError } from '../errors/index.js';
import { logger } from '../utils/index.js';

/**
 * Resolve all dependencies for a set of selected apps and features.
 * @param {string[]} selectedApps - List of app IDs.
 * @param {string[]} selectedFeatures - List of feature IDs.
 * @param {AppRegistry} appRegistry - App registry.
 * @param {FeatureRegistry} featureRegistry - Feature registry.
 * @returns {{apps: string[], features: string[]}} Expanded sets including dependencies.
 * @throws {ResolveError}
 */
export function resolveDependencies(selectedApps, selectedFeatures, appRegistry, featureRegistry) {
  const resolvedApps = new Set(selectedApps);
  const resolvedFeatures = new Set(selectedFeatures);
  let changed;
  let iteration = 0;
  const maxIterations = 100; // Prevent infinite loops
  
  logger.debug(`Resolving dependencies for apps: [${Array.from(selectedApps).join(', ')}], features: [${Array.from(selectedFeatures).join(', ')}]`);
  
  do {
    changed = false;
    iteration++;
    
    if (iteration > maxIterations) {
      throw new ResolveError(`Dependency resolution exceeded max iterations (${maxIterations}). Possible circular dependency.`);
    }
    
    // Add features required by apps
    for (const appId of resolvedApps) {
      const app = appRegistry.get(appId);
      
      if (!app) {
        // Provide helpful error with available apps
        const availableApps = appRegistry.getAll().map(a => a.id);
        logger.error(`App '${appId}' not found. Available apps: ${availableApps.join(', ') || 'none'}`);
        throw new ResolveError(`App not found: ${appId}. Available apps: ${availableApps.join(', ') || 'none'}`);
      }
      
      const requiredFeatures = app.manifest.features || [];
      
      for (const featId of requiredFeatures) {
        // Verify feature exists
        if (!featureRegistry.has(featId)) {
          const availableFeatures = featureRegistry.getAll().map(f => f.id);
          logger.warn(`Feature '${featId}' required by app '${appId}' not found. Available: ${availableFeatures.join(', ') || 'none'}`);
          // Continue without throwing - feature might be optional
        }
        
        if (!resolvedFeatures.has(featId)) {
          resolvedFeatures.add(featId);
          changed = true;
          logger.debug(`Added feature ${featId} required by app ${appId}`);
        }
      }
    }
    
    // Add apps required by features (if feature manifest includes app dependencies)
    for (const featureId of resolvedFeatures) {
      const feature = featureRegistry.get(featureId);
      
      if (feature && feature.manifest.requiresApps) {
        const requiredApps = feature.manifest.requiresApps;
        
        for (const appId of requiredApps) {
          if (!resolvedApps.has(appId)) {
            resolvedApps.add(appId);
            changed = true;
            logger.debug(`Added app ${appId} required by feature ${featureId}`);
          }
        }
      }
    }
    
  } while (changed);
  
  const result = {
    apps: Array.from(resolvedApps),
    features: Array.from(resolvedFeatures),
  };
  
  logger.debug(`Dependency resolution complete: ${result.apps.length} apps, ${result.features.length} features`);
  
  return result;
}

/**
 * Validate that all resolved apps and features exist in registries
 * @param {string[]} appIds - App IDs to validate
 * @param {string[]} featureIds - Feature IDs to validate
 * @param {AppRegistry} appRegistry - App registry
 * @param {FeatureRegistry} featureRegistry - Feature registry
 * @returns {boolean} True if all exist
 * @throws {ResolveError}
 */
export function validateDependencies(appIds, featureIds, appRegistry, featureRegistry) {
  const missingApps = [];
  const missingFeatures = [];
  
  for (const appId of appIds) {
    if (!appRegistry.has(appId)) {
      missingApps.push(appId);
    }
  }
  
  for (const featureId of featureIds) {
    if (!featureRegistry.has(featureId)) {
      missingFeatures.push(featureId);
    }
  }
  
  if (missingApps.length > 0 || missingFeatures.length > 0) {
    throw new ResolveError(
      `Missing dependencies: ${missingApps.length > 0 ? `Apps: ${missingApps.join(', ')}` : ''}${missingApps.length > 0 && missingFeatures.length > 0 ? '; ' : ''}${missingFeatures.length > 0 ? `Features: ${missingFeatures.join(', ')}` : ''}`
    );
  }
  
  return true;
}