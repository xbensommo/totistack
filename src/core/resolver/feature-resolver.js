import { DependencyResolver } from './dependency-resolver.js';

/**
 * Resolves features with dependencies and app expansion.
 */
export class FeatureResolver {
  /**
   * @param {import('../registry/feature-registry.js').FeatureRegistry} featureRegistry
   */
  constructor(featureRegistry) {
    this.featureRegistry = featureRegistry;
    this.resolver = new DependencyResolver(
      (id) => this.featureRegistry.get(id),
      (item) => item.dependencies || [],
    );
  }

  /**
   * @param {string[]} ids
   * @returns {any[]}
   */
  resolve(ids = []) {
    return this.resolver.resolve(ids);
  }

  /**
   * @param {string[]} ids
   * @returns {string[]}
   */
  resolveAppIds(ids = []) {
    const orderedFeatures = this.resolve(ids);
    return Array.from(new Set(orderedFeatures.flatMap((feature) => feature.apps || [])));
  }
}

/**
 * Backward-compatible resolver helper.
 * @param {import('../registry/feature-registry.js').FeatureRegistry} registry
 * @param {string[]} ids
 * @returns {any[]}
 */
export function resolveFeatures(registry, ids = []) {
  return new FeatureResolver(registry).resolve(ids);
}

/**
 * Backward-compatible feature-to-app expansion helper.
 * @param {import('../registry/feature-registry.js').FeatureRegistry} registry
 * @param {string[]} ids
 * @returns {string[]}
 */
export function resolveFeatureAppIds(registry, ids = []) {
  return new FeatureResolver(registry).resolveAppIds(ids);
}
