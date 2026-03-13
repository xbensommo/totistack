/**
 * @file module-resolver.js
 * @description Resolve Totistack preset features and feature dependencies.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

/**
 * Resolve all features required by preset + requested features.
 *
 * Rules:
 * - preset.features are included first
 * - requested features are included next
 * - feature.requires are resolved recursively
 * - dependencies are installed before dependents
 * - circular dependencies throw
 * - unknown features throw
 *
 * @param {object|null} preset - Selected preset.
 * @param {Array<string>} requested - CLI-requested feature names.
 * @param {Array<object>} registryFeatures - All registered feature modules.
 * @returns {Array<object>} Ordered resolved feature modules.
 */
export function resolveFeatures(
  preset = null,
  requested = [],
  registryFeatures = []
) {
  const registry = new Map(registryFeatures.map((feature) => [feature.name, feature]));
  const roots = [
    ...(Array.isArray(preset?.features) ? preset.features : []),
    ...requested,
  ];

  const resolved = [];
  const visited = new Set();
  const visiting = new Set();

  /**
   * Visit a feature and resolve dependencies first.
   *
   * @param {string} name - Feature name.
   * @returns {void}
   */
  function visit(name) {
    if (visited.has(name)) {
      return;
    }

    if (visiting.has(name)) {
      throw new Error(`Circular feature dependency detected: ${name}`);
    }

    const feature = registry.get(name);

    if (!feature) {
      throw new Error(`Unknown feature dependency: ${name}`);
    }

    visiting.add(name);

    for (const dep of normalizeRequires(feature.requires)) {
      visit(dep);
    }

    visiting.delete(name);
    visited.add(name);
    resolved.push(feature);
  }

  for (const name of roots) {
    visit(name);
  }

  return resolved;
}

/**
 * Normalize a feature requires field into an array of strings.
 *
 * @param {*} requires - Feature requires value.
 * @returns {Array<string>} Dependency names.
 */
function normalizeRequires(requires) {
  if (!requires) return [];
  if (!Array.isArray(requires)) {
    throw new TypeError(`Feature "requires" must be an array`);
  }

  return requires.filter(Boolean);
}