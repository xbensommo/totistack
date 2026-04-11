import { DependencyResolver } from './dependency-resolver.js';

/**
 * Resolves apps with transitive dependencies.
 */
export class AppResolver {
  /**
   * @param {import('../registry/app-registry.js').AppRegistry} registry
   */
  constructor(registry) {
    this.registry = registry;
    this.resolver = new DependencyResolver(
      (id) => this.registry.get(id),
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
}

/**
 * Backward-compatible resolver helper.
 * @param {import('../registry/app-registry.js').AppRegistry} registry
 * @param {string[]} ids
 * @returns {any[]}
 */
export function resolveApps(registry, ids = []) {
  return new AppResolver(registry).resolve(ids);
}
