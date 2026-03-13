Yes. This is the next upgrade you should do.

Manual imports are fine for MVP, but they become a maintenance problem fast.
Auto-discovery makes the composer feel like a real framework.

## Goal

Instead of this:

```js
import seo from '../features/seo/index.js';
import auth from '../features/auth/index.js';
import booking from '../features/booking/index.js';
```

…you want this behavior:

* scan `src/features/*/index.js`
* scan `src/presets/*.js`
* dynamically import them
* validate them
* build the registry automatically

---

# Recommended structure

Keep this convention:

```txt
src/
  features/
    auth/
      index.js
    booking/
      index.js
    dashboard/
      index.js
    seo/
      index.js

  presets/
    booking-platform.js
    marketing-website.js
    ecommerce-store.js
```

That structure is simple and stable.

---

# Important Node reality

Because this is a Node CLI, auto-discovery should use the filesystem plus dynamic `import()`.

Since you're using ESM, this works well.

---

# 1. Create the auto-registry loader

Create: `src/core/registry.js`

```js
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

const FEATURE_DIR = path.resolve(process.cwd(), 'src/features');
const PRESET_DIR = path.resolve(process.cwd(), 'src/presets');

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
    const preset = await importModule(presetPath);
    assertPresetShape(preset);
    presets.push(preset);
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
```

---

# Why this is better

This removes the need to edit registry imports every time you add a feature.

Now when you add:

```txt
src/features/whatsapp/index.js
```

…it becomes available automatically.

That is exactly what you want in a modular composer.

---

# 2. Update the resolver for async registry access

Because `getFeature()` is now async, the resolver must become async too.

Create or replace: `src/core/resolver.js`

```js
import { getFeature } from './registry.js';

export async function resolveFeatures(inputFeatures = []) {
  const resolved = [];
  const visiting = new Set();
  const visited = new Set();

  async function visit(featureName, ancestry = []) {
    if (visited.has(featureName)) return;

    const feature = await getFeature(featureName);
    if (!feature) {
      throw new Error(`Unknown feature: "${featureName}"`);
    }

    if (visiting.has(featureName)) {
      const cycle = [...ancestry, featureName].join(' -> ');
      throw new Error(`Circular dependency detected: ${cycle}`);
    }

    visiting.add(featureName);

    for (const dep of feature.dependencies || []) {
      await visit(dep, [...ancestry, featureName]);
    }

    visiting.delete(featureName);
    visited.add(featureName);

    if (!resolved.includes(featureName)) {
      resolved.push(featureName);
    }
  }

  for (const featureName of inputFeatures) {
    await visit(featureName);
  }

  await validateIncompatibilities(resolved);

  return resolved;
}

export async function validateIncompatibilities(featureNames) {
  for (const featureName of featureNames) {
    const feature = await getFeature(featureName);
    if (!feature) continue;

    for (const blocked of feature.incompatibleWith || []) {
      if (featureNames.includes(blocked)) {
        throw new Error(`Feature conflict: "${featureName}" is incompatible with "${blocked}"`);
      }
    }
  }
}
```

---

# 3. Update preset resolver

Create or replace: `src/core/preset.js`

```js
import { getPreset } from './registry.js';
import { resolveFeatures } from './resolver.js';

export async function resolvePreset(presetName) {
  const preset = await getPreset(presetName);

  if (!preset) {
    throw new Error(`Unknown preset: "${presetName}"`);
  }

  return {
    ...preset,
    resolvedFeatures: await resolveFeatures(preset.features || []),
  };
}
```

---

# 4. Update installer to use async feature lookup

Replace: `src/core/installer.js`

```js
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
```

---

# 5. Update `create` command

Replace: `src/cli/commands/create.js`

```js
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { ensureProjectRoot, ensureBasePackageJson } from '../../core/project.js';
import { createDefaultManifest } from '../../core/default-manifest.js';
import { saveManifest } from '../../core/manifest.js';
import { listPresets, listFeatures } from '../../core/registry.js';
import { resolvePreset } from '../../core/preset.js';
import { resolveFeatures } from '../../core/resolver.js';
import { installFeatures } from '../../core/installer.js';

export function registerCreateCommand(program) {
  program
    .command('create <projectName>')
    .description('Create a new Totisoft project')
    .option('--preset <presetName>', 'Preset to use')
    .option('--features <items>', 'Comma-separated features')
    .option('--stack <stack>', 'Stack name', 'vue-firebase')
    .option('--dry-run', 'Preview without writing files')
    .action(async (projectName, options) => {
      try {
        const projectRoot = path.resolve(process.cwd(), projectName);

        let presetName = options.preset;
        let selectedFeatures = options.features
          ? options.features.split(',').map((item) => item.trim()).filter(Boolean)
          : [];

        if (!presetName) {
          const presets = await listPresets();

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'preset',
              message: 'Choose a project preset',
              choices: presets.map((preset) => ({
                name: `${preset.title} — ${preset.description}`,
                value: preset.name,
              })),
            },
          ]);

          presetName = answer.preset;
        }

        const preset = await resolvePreset(presetName);

        if (!options.features) {
          const allFeatures = await listFeatures();
          const optionalFeaturePool = allFeatures.filter(
            (feature) => !preset.resolvedFeatures.includes(feature.name)
          );

          const answer = await inquirer.prompt([
            {
              type: 'checkbox',
              name: 'extraFeatures',
              message: 'Select extra features',
              choices: optionalFeaturePool.map((feature) => ({
                name: `${feature.title} — ${feature.description}`,
                value: feature.name,
              })),
            },
          ]);

          selectedFeatures = answer.extraFeatures;
        }

        const finalFeatureSet = await resolveFeatures([
          ...preset.features,
          ...selectedFeatures,
        ]);

        if (!options.dryRun) {
          await ensureProjectRoot(projectRoot);
          await ensureBasePackageJson(projectRoot, projectName);

          const manifest = createDefaultManifest({
            name: projectName,
            stack: options.stack,
            preset: preset.name,
            features: [],
            options: preset.options || {},
          });

          await saveManifest(projectRoot, manifest);
        }

        const result = await installFeatures({
          projectRoot,
          featureNames: finalFeatureSet,
          dryRun: !!options.dryRun,
        });

        console.log(chalk.green.bold('\nProject created successfully.\n'));
        console.log(chalk.white(`Preset: ${preset.title}`));
        console.log(chalk.white(`Features: ${result.finalFeatures.join(', ')}`));
        console.log(chalk.white(`Location: ${projectRoot}\n`));
      } catch (error) {
        console.error(chalk.red.bold('\nCreate failed:'), error.message);
        process.exit(1);
      }
    });
}
```

---

# 6. Update `features` command

Replace: `src/cli/commands/features.js`

```js
import chalk from 'chalk';
import { listFeatures } from '../../core/registry.js';

export function registerFeaturesCommand(program) {
  program
    .command('features')
    .description('List available features')
    .action(async () => {
      const features = await listFeatures();

      console.log(chalk.cyan.bold('\nAvailable features:\n'));

      for (const feature of features) {
        console.log(chalk.white(`${feature.name}`));
        console.log(`  ${feature.title}`);
        console.log(`  ${feature.description}`);
        console.log(`  dependencies: ${(feature.dependencies || []).join(', ') || 'none'}`);
        console.log('');
      }
    });
}
```

---

# 7. Update `presets` command

Replace: `src/cli/commands/presets.js`

```js
import chalk from 'chalk';
import { listPresets } from '../../core/registry.js';

export function registerPresetsCommand(program) {
  program
    .command('presets')
    .description('List available presets')
    .action(async () => {
      const presets = await listPresets();

      console.log(chalk.cyan.bold('\nAvailable presets:\n'));

      for (const preset of presets) {
        console.log(chalk.white(`${preset.name}`));
        console.log(`  ${preset.title}`);
        console.log(`  ${preset.description}`);
        console.log(`  features: ${(preset.features || []).join(', ') || 'none'}`);
        console.log('');
      }
    });
}
```

---

# 8. Update `doctor` command

Replace: `src/cli/commands/doctor.js`

```js
import chalk from 'chalk';
import { loadManifest } from '../../core/manifest.js';
import { getFeature } from '../../core/registry.js';

export function registerDoctorCommand(program) {
  program
    .command('doctor')
    .description('Validate project manifest and installed feature metadata')
    .action(async () => {
      try {
        const manifest = await loadManifest(process.cwd());

        if (!manifest) {
          throw new Error('No toti.project.json found in current directory.');
        }

        const problems = [];

        for (const featureName of manifest.features || []) {
          const feature = await getFeature(featureName);
          if (!feature) {
            problems.push(`Unknown installed feature in manifest: ${featureName}`);
          }
        }

        if (problems.length) {
          console.log(chalk.red.bold('\nDoctor found problems:\n'));
          for (const issue of problems) {
            console.log(chalk.red(`- ${issue}`));
          }
          process.exit(1);
        }

        console.log(chalk.green.bold('\nDoctor check passed.\n'));
        console.log(chalk.white(`Project: ${manifest.name}`));
        console.log(chalk.white(`Preset: ${manifest.preset || 'none'}`));
        console.log(chalk.white(`Features: ${(manifest.features || []).join(', ') || 'none'}\n`));
      } catch (error) {
        console.error(chalk.red.bold('\nDoctor failed:'), error.message);
        process.exit(1);
      }
    });
}
```

---

# 9. Example feature still works unchanged

Example: `src/features/booking/index.js`

```js
export default {
  name: 'booking',
  title: 'Booking System',
  description: 'Appointments, scheduling, and booking workflows.',
  category: 'platform',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/booking');
    await ctx.writeFile(
      'src/modules/booking/index.js',
      `export const bookingModule = {
  enabled: true,
  version: 1,
};
`
    );

    await ctx.addEnv([
      'VITE_BOOKING_ENABLED=true',
    ]);

    await ctx.addDependencies(['date-fns']);
  },
};
```

No registry edits needed anymore.

---

# 10. Very important improvement

Your current loader uses:

```js
const FEATURE_DIR = path.resolve(process.cwd(), 'src/features');
const PRESET_DIR = path.resolve(process.cwd(), 'src/presets');
```

That works if the CLI is run from the CLI project itself.

But if you later install this CLI globally or use `npm link`, `process.cwd()` becomes the user's current project directory, not the CLI package directory.

So the stronger production-safe version is to resolve relative to the registry file itself.

Use this version instead.

## Production-safe directory resolution

Replace the top of `src/core/registry.js` with:

```js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEATURE_DIR = path.resolve(__dirname, '../features');
const PRESET_DIR = path.resolve(__dirname, '../presets');
```

That is the correct version for a published CLI.

---

# 11. Why this is powerful

Now your workflow becomes:

1. create folder
2. add `index.js`
3. export feature object
4. done

Example:

```txt
src/features/whatsapp/index.js
```

Immediately becomes available in:

```bash
toti features
toti create
toti add whatsapp
```

That is the right architecture.

---

# 12. My honest recommendation

Do this now, before prompts and page generation.

Because once prompts, hooks, file-copy logic, and sync start growing, manual imports become annoying.

Auto-discovery now keeps the whole system clean.

---

# 13. One small limitation to know

This loader currently scans only:

* `src/features/<name>/index.js`
* `src/presets/*.js`

That is good.

Do **not** make it recursively scan everything yet.
Recursive discovery adds complexity you do not need right now.

Keep conventions strict.

---

# 14. Next best upgrade

After this, the strongest next step is:

* **feature prompts**
* then **template copy engine**
* then **sync command**

That gives you a real composer.

I can write the next layer as actual code: **prompt runner + feature options collection + passing answers into installers**.
