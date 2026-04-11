/**
 * Preset installer returns the expanded preset list for higher-level orchestration.
 */
export class PresetInstaller {
  /**
   * @param {string} projectRoot
   * @param {any[]} presets
   * @returns {Promise<{ projectRoot: string, presetIds: string[] }>}
   */
  async install(projectRoot, presets = []) {
    return {
      projectRoot,
      presetIds: presets.map((item) => item.id),
    };
  }
}

/**
 * Backward-compatible installer helper.
 * @param {string} projectRoot
 * @param {any} presets
 * @param {object} [options]
 * @returns {Promise<void>}
 */
export async function installPresets(projectRoot, presets = [], options = {}) {
  const installer = new PresetInstaller(options);
  await installer.install(projectRoot, presets);
}
