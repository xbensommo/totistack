import fs from 'fs/promises';
import path from 'path';
import { createDefaultManifest } from './default-manifest.js';

export const MANIFEST_FILE = 'toti.project.json';

export async function loadManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, MANIFEST_FILE);

  try {
    const raw = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error(`Failed to read manifest: ${error.message}`);
  }
}

export async function saveManifest(projectRoot, manifest) {
  const manifestPath = path.join(projectRoot, MANIFEST_FILE);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

export async function ensureManifest(projectRoot, overrides = {}) {
  let manifest = await loadManifest(projectRoot);

  if (!manifest) {
    manifest = createDefaultManifest(overrides);
    await saveManifest(projectRoot, manifest);
  }

  return manifest;
}