import { getFeature } from './registry.js';
import { resolveFeatures } from './resolver.js';
import { createInstallerContext } from './installer-context.js';
import { loadManifest, saveManifest } from './manifest.js';

export async function installFeatures({
  projectRoot,
  featureNames,
  dryRun = false,
}) {
  const manifest = await loadManifest(projectRoot);

  if (!manifest) {
    throw new Error('No toti.project.json found. Run create first.');
  }

  const requested = [...new Set([...(manifest.features || []), ...featureNames])];
  const finalFeatures = await resolveFeatures(requested);

  const toInstall = finalFeatures.filter((name) => !(manifest.features || []).includes(name));

  const ctx = createInstallerContext({
    projectRoot,
    manifest,
    dryRun,
  });

  for (const featureName of toInstall) {
    const feature = await getFeature(featureName);

    if (!feature) {
      throw new Error(`Cannot install missing feature "${featureName}"`);
    }

    ctx.log(`Installing feature: ${feature.name}`);
    await feature.install(ctx);
    ctx.success(`Installed feature: ${feature.name}`);
  }

  const nextManifest = {
    ...manifest,
    features: finalFeatures,
    updatedAt: new Date().toISOString(),
  };

  if (!dryRun) {
    await saveManifest(projectRoot, nextManifest);
  }

  return {
    manifest: nextManifest,
    installed: toInstall,
    finalFeatures,
  };
}