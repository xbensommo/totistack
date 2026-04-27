/**
 * @file src/core/actions/create-action-registry.js
 * @description Registry helper for grouping action definitions by module.
 */

/**
 * Create a tiny action registry wrapper.
 *
 * @param {Array<Record<string, any>>} [definitions=[]]
 * @returns {{ definitions: Array<Record<string, any>>, install: (executor: { registerMany: Function }) => void }}
 */
export function createActionRegistry(definitions = []) {
  return {
    definitions: [...definitions],
    install(executor) {
      executor.registerMany(definitions);
    },
  };
}
