/**
 * @file registry.js
 * @description Registry loader and validator for Totistack presets and features.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEATURE_DIR = path.resolve(__dirname, "../features");
const PRESET_DIR = path.resolve(__dirname, "../presets");

/**
 * Checks whether a path exists.
 *
 * @param {string} targetPath - Path to test.
 * @returns {Promise<boolean>} True if it exists.
 */
async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Imports a module from disk and returns its default export when present.
 *
 * @param {string} filePath - Absolute module file path.
 * @returns {Promise<object>} Imported module definition.
 */
async function importModule(filePath) {
  const fileUrl = pathToFileURL(filePath).href;
  const imported = await import(fileUrl);
  return imported.default || imported;
}

/**
 * Ensures a module has a valid name.
 *
 * @param {object} mod - Module definition.
 * @param {"preset"|"feature"} type - Module type label.
 * @returns {void}
 */
function assertValidName(mod, type) {
  if (!mod || typeof mod !== "object") {
    throw new Error(`Invalid ${type}: expected object export`);
  }

  if (!mod.name || typeof mod.name !== "string" || !mod.name.trim()) {
    throw new Error(`Invalid ${type}: missing "name"`);
  }
}

/**
 * Validates lifecycle hook shape on a module.
 *
 * Supports both:
 * - beforeInstall / afterInstall
 * - hooks.beforeInstall / hooks.afterInstall
 *
 * @param {object} mod - Module definition.
 * @param {"preset"|"feature"} type - Module type label.
 * @returns {void}
 */
function assertHooksShape(mod, type) {
  const hookNames = ["beforeInstall", "afterInstall"];

  for (const hookName of hookNames) {
    if (mod[hookName] != null && typeof mod[hookName] !== "function") {
      throw new Error(
        `Invalid ${type} "${mod.name}": "${hookName}" must be a function`
      );
    }
  }

  if (mod.hooks != null) {
    if (typeof mod.hooks !== "object" || Array.isArray(mod.hooks)) {
      throw new Error(
        `Invalid ${type} "${mod.name}": "hooks" must be an object`
      );
    }

    for (const hookName of hookNames) {
      if (
        mod.hooks[hookName] != null &&
        typeof mod.hooks[hookName] !== "function"
      ) {
        throw new Error(
          `Invalid ${type} "${mod.name}": "hooks.${hookName}" must be a function`
        );
      }
    }
  }
}

/**
 * Validates a feature module shape.
 *
 * @param {object} feature - Feature module.
 * @returns {void}
 */
/**
 * Validate a feature module shape.
 *
 * @param {object} mod - Feature module.
 * @returns {void}
 */
function assertFeatureShape(mod) {
  assertValidName(mod, "feature");
  assertHooksShape(mod, "feature");

  if (mod.title != null && typeof mod.title !== "string") {
    throw new Error(`Invalid feature "${mod.name}": "title" must be a string`);
  }

  if (mod.description != null && typeof mod.description !== "string") {
    throw new Error(
      `Invalid feature "${mod.name}": "description" must be a string`
    );
  }

  if (mod.install != null && typeof mod.install !== "function") {
    throw new Error(
      `Invalid feature "${mod.name}": "install" must be a function`
    );
  }

  if (mod.prompts != null && !Array.isArray(mod.prompts)) {
    throw new Error(`Invalid feature "${mod.name}": "prompts" must be an array`);
  }

  if (mod.requires != null) {
    if (!Array.isArray(mod.requires)) {
      throw new Error(`Invalid feature "${mod.name}": "requires" must be an array`);
    }

    for (const dep of mod.requires) {
      if (typeof dep !== "string" || !dep.trim()) {
        throw new Error(
          `Invalid feature "${mod.name}": each "requires" entry must be a non-empty string`
        );
      }
    }
  }
}

/**
 * Validates a preset module shape.
 *
 * @param {object} preset - Preset module.
 * @returns {void}
 */
function assertPresetShape(preset) {
  assertValidName(preset, "preset");
  assertHooksShape(preset, "preset");

  if (typeof preset.title !== "string" || !preset.title.trim()) {
    throw new Error(`Invalid preset "${preset.name}": missing "title"`);
  }

  if (typeof preset.description !== "string") {
    throw new Error(`Invalid preset "${preset.name}": missing "description"`);
  }

  if (!Array.isArray(preset.features)) {
    throw new Error(`Invalid preset "${preset.name}": "features" must be an array`);
  }

  if (
    preset.options != null &&
    (typeof preset.options !== "object" || Array.isArray(preset.options))
  ) {
    throw new Error(`Invalid preset "${preset.name}": "options" must be an object`);
  }

  if (preset.install != null && typeof preset.install !== "function") {
    throw new Error(`Invalid preset "${preset.name}": "install" must be a function`);
  }
}

/**
 * Ensures names are unique across loaded modules.
 *
 * @param {Array<object>} items - Module list.
 * @param {"preset"|"feature"} type - Module type label.
 * @returns {void}
 */
function assertUniqueNames(items, type) {
  const seen = new Set();

  for (const item of items) {
    if (seen.has(item.name)) {
      throw new Error(`Duplicate ${type} detected: "${item.name}"`);
    }

    seen.add(item.name);
  }
}

/**
 * Loads feature modules from subdirectories such as:
 * - features/auth/index.js
 * - features/forms/index.js
 *
 * @param {string} [featureDir=FEATURE_DIR] - Features directory path.
 * @returns {Promise<Array<object>>} Loaded feature modules.
 */
async function loadFeatureModules(featureDir = FEATURE_DIR) {
  const exists = await pathExists(featureDir);
  if (!exists) {
    return [];
  }

  const entries = await fs.readdir(featureDir, { withFileTypes: true });
  const features = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const featureIndexPath = path.join(featureDir, entry.name, "index.js");
    const hasIndex = await pathExists(featureIndexPath);

    if (!hasIndex) {
      continue;
    }

    try {
      const feature = await importModule(featureIndexPath);
      feature.type = "feature";
      assertFeatureShape(feature);
      features.push(feature);
    } catch (error) {
      throw new Error(`Invalid feature "${entry.name}": ${error.message}`);
    }
  }

  assertUniqueNames(features, "feature");
  return features.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Loads preset modules from files such as:
 * - presets/booking-platform.js
 * - presets/client-portal.js
 *
 * @param {string} [presetDir=PRESET_DIR] - Presets directory path.
 * @returns {Promise<Array<object>>} Loaded preset modules.
 */
async function loadPresetModules(presetDir = PRESET_DIR) {
  const exists = await pathExists(presetDir);
  if (!exists) {
    return [];
  }

  const entries = await fs.readdir(presetDir, { withFileTypes: true });
  const presets = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      continue;
    }

    const presetPath = path.join(presetDir, entry.name);

    try {
      const preset = await importModule(presetPath);
      preset.type = "preset";
      assertPresetShape(preset);
      presets.push(preset);
    } catch (error) {
      throw new Error(`Invalid preset file "${entry.name}": ${error.message}`);
    }
  }

  assertUniqueNames(presets, "preset");
  return presets.sort((a, b) => a.name.localeCompare(b.name));
}

let registryCache = null;

/**
 * Loads the Totistack registry from disk.
 *
 * When no custom directories are supplied, results are cached.
 *
 * @param {object} [options={}] - Loader options.
 * @param {boolean} [options.reload=false] - Whether to bypass cache.
 * @param {string} [options.featuresDir=FEATURE_DIR] - Custom features directory.
 * @param {string} [options.presetsDir=PRESET_DIR] - Custom presets directory.
 * @returns {Promise<{
 *   features: Array<object>,
 *   presets: Array<object>,
 *   featureMap: Map<string, object>,
 *   presetMap: Map<string, object>
 * }>}
 */
export async function loadRegistry({
  reload = false,
  featuresDir = FEATURE_DIR,
  presetsDir = PRESET_DIR,
} = {}) {
  const usingDefaults =
    featuresDir === FEATURE_DIR && presetsDir === PRESET_DIR;

  if (usingDefaults && registryCache && !reload) {
    return registryCache;
  }

  const [features, presets] = await Promise.all([
    loadFeatureModules(featuresDir),
    loadPresetModules(presetsDir),
  ]);

  const registry = {
    features,
    presets,
    featureMap: new Map(features.map((item) => [item.name, item])),
    presetMap: new Map(presets.map((item) => [item.name, item])),
  };

  if (usingDefaults) {
    registryCache = registry;
  }

  return registry;
}

/**
 * Returns all registered features.
 *
 * @returns {Promise<Array<object>>} Feature list.
 */
export async function listFeatures() {
  const registry = await loadRegistry();
  return registry.features;
}

/**
 * Returns all registered presets.
 *
 * @returns {Promise<Array<object>>} Preset list.
 */
export async function listPresets() {
  const registry = await loadRegistry();
  return registry.presets;
}

/**
 * Gets a feature by name.
 *
 * @param {string} name - Feature name.
 * @returns {Promise<object|null>} Feature module or null.
 */
export async function getFeature(name) {
  const registry = await loadRegistry();
  return registry.featureMap.get(name) || null;
}

/**
 * Gets a preset by name.
 *
 * @param {string} name - Preset name.
 * @returns {Promise<object|null>} Preset module or null.
 */
export async function getPreset(name) {
  const registry = await loadRegistry();
  return registry.presetMap.get(name) || null;
}