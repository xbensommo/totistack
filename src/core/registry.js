import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEATURE_DIR = path.resolve(__dirname, '../features');
const PRESET_DIR = path.resolve(__dirname, '../presets');

function assertValidName(name, type) {
  if (!name || typeof name !== 'string') {
    throw new Error(`Invalid ${type}: missing "name"`);
  }
}

function assertFeatureShape(feature) {
  assertValidName(feature.name, 'feature');

  if (typeof feature.title !== 'string' || !feature.title.trim()) {
    throw new Error(`Invalid feature "${feature.name}": missing "title"`);
  }

  if (typeof feature.description !== 'string') {
    throw new Error(`Invalid feature "${feature.name}": missing "description"`);
  }

  if (typeof feature.install !== 'function') {
    throw new Error(`Invalid feature "${feature.name}": missing "install" function`);
  }

  if (feature.dependencies && !Array.isArray(feature.dependencies)) {
    throw new Error(`Invalid feature "${feature.name}": "dependencies" must be an array`);
  }

  if (feature.optionalDependencies && !Array.isArray(feature.optionalDependencies)) {
    throw new Error(
      `Invalid feature "${feature.name}": "optionalDependencies" must be an array`
    );
  }

  if (feature.incompatibleWith && !Array.isArray(feature.incompatibleWith)) {
    throw new Error(
      `Invalid feature "${feature.name}": "incompatibleWith" must be an array`
    );
  }

  if (feature.prompts && !Array.isArray(feature.prompts)) {
    throw new Error(`Invalid feature "${feature.name}": "prompts" must be an array`);
  }
}

function assertPresetShape(preset) {
  assertValidName(preset.name, 'preset');

  if (typeof preset.title !== 'string' || !preset.title.trim()) {
    throw new Error(`Invalid preset "${preset.name}": missing "title"`);
  }

  if (typeof preset.description !== 'string') {
    throw new Error(`Invalid preset "${preset.name}": missing "description"`);
  }

  if (!Array.isArray(preset.features)) {
    throw new Error(`Invalid preset "${preset.name}": "features" must be an array`);
  }
}

function assertUniqueNames(items, type) {
  const seen = new Set();

  for (const item of items) {
    if (seen.has(item.name)) {
      throw new Error(`Duplicate ${type} detected: "${item.name}"`);
    }
    seen.add(item.name);
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function importModule(filePath) {
  const fileUrl = pathToFileURL(filePath).href;
  const imported = await import(fileUrl);
  return imported.default || imported;
}

async function loadFeatureModules(featureDir = FEATURE_DIR) {
  const exists = await pathExists(featureDir);
  if (!exists) return [];

  const entries = await fs.readdir(featureDir, { withFileTypes: true });
  const features = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const featureIndexPath = path.join(featureDir, entry.name, 'index.js');
    const hasIndex = await pathExists(featureIndexPath);
    if (!hasIndex) continue;

    const feature = await importModule(featureIndexPath);
    assertFeatureShape(feature);
    features.push(feature);
  }

  assertUniqueNames(features, 'feature');
  return features.sort((a, b) => a.name.localeCompare(b.name));
}

async function loadPresetModules(presetDir = PRESET_DIR) {
  const exists = await pathExists(presetDir);
  if (!exists) return [];

  const entries = await fs.readdir(presetDir, { withFileTypes: true });
  const presets = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.js')) continue;

    const presetPath = path.join(presetDir, entry.name);

    try {
      const preset = await importModule(presetPath);
      //console.log('PRESET FILE:', entry.name, preset);
      assertPresetShape(preset);
      presets.push(preset);
    } catch (error) {
      throw new Error(`Invalid preset file "${entry.name}": ${error.message}`);
    }
  }

  assertUniqueNames(presets, 'preset');
  return presets.sort((a, b) => a.name.localeCompare(b.name));
}

let registryCache = null;

export async function loadRegistry({ reload = false } = {}) {
  if (registryCache && !reload) {
    return registryCache;
  }

  const [features, presets] = await Promise.all([
    loadFeatureModules(),
    loadPresetModules(),
  ]);

  registryCache = {
    features,
    presets,
    featureMap: new Map(features.map((item) => [item.name, item])),
    presetMap: new Map(presets.map((item) => [item.name, item])),
  };

  return registryCache;
}

export async function listFeatures() {
  const registry = await loadRegistry();
  return registry.features;
}

export async function listPresets() {
  const registry = await loadRegistry();
  return registry.presets;
}

export async function getFeature(name) {
  const registry = await loadRegistry();
  return registry.featureMap.get(name) || null;
}

export async function getPreset(name) {
  const registry = await loadRegistry();
  return registry.presetMap.get(name) || null;
}