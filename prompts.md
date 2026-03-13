Yes. Let’s lock it in properly.

Below is the **final feature prompts implementation** for Totistack so it works end-to-end and stays clean.

---

## 1) `src/core/default-manifest.js`

```js
export function createDefaultManifest(overrides = {}) {
  return {
    name: '',
    framework: 'vue',
    stack: 'vue-firebase',
    preset: null,
    features: [],
    featureConfig: {},
    options: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
```

---

## 2) `src/core/feature-prompts.js`

```js
import inquirer from 'inquirer';
import { getFeature } from './registry.js';

export async function collectFeatureAnswers(featureNames, { existingAnswers = {} } = {}) {
  const allAnswers = structuredClone(existingAnswers);

  for (const featureName of featureNames) {
    const feature = await getFeature(featureName);

    if (!feature) {
      throw new Error(`Unknown feature: "${featureName}"`);
    }

    const prompts = Array.isArray(feature.prompts) ? feature.prompts : [];
    if (!prompts.length) continue;

    const existingFeatureAnswers = allAnswers[featureName] || {};

    const unansweredPrompts = prompts.filter((prompt) => {
      return !(prompt.name in existingFeatureAnswers);
    });

    if (!unansweredPrompts.length) continue;

    const answers = await inquirer.prompt(
      unansweredPrompts.map((prompt) => ({
        ...prompt,
        when: prompt.when
          ? (currentAnswers) => prompt.when(currentAnswers, {
              featureName,
              allAnswers,
              feature,
            })
          : undefined,
      }))
    );

    allAnswers[featureName] = {
      ...existingFeatureAnswers,
      ...answers,
    };
  }

  return allAnswers;
}
```

---

## 3) `src/core/installer-context.js`

Use this final version so feature installers can read config cleanly.

```js
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { loadManifest, saveManifest } from './manifest.js';

async function exists(fullPath) {
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

export function createInstallerContext({ projectRoot, manifest, dryRun = false }) {
  const resolvePath = (...parts) => path.join(projectRoot, ...parts);

  async function ensureDir(relativePath) {
    const fullPath = resolvePath(relativePath);
    if (dryRun) return;
    await fs.mkdir(fullPath, { recursive: true });
  }

  async function writeFile(relativePath, content, { overwrite = false } = {}) {
    const fullPath = resolvePath(relativePath);
    const alreadyExists = await exists(fullPath);

    if (alreadyExists && !overwrite) return false;
    if (dryRun) return true;

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
    return true;
  }

  async function readJson(relativePath, fallback = {}) {
    const fullPath = resolvePath(relativePath);

    try {
      const raw = await fs.readFile(fullPath, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      if (error.code === 'ENOENT') return fallback;
      throw error;
    }
  }

  async function upsertJson(relativePath, updater) {
    const fullPath = resolvePath(relativePath);
    const current = await readJson(relativePath, {});
    const next = await updater(structuredClone(current));

    if (dryRun) return next;

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
    return next;
  }

  async function addEnv(lines = []) {
    const fullPath = resolvePath('.env');
    let current = '';

    try {
      current = await fs.readFile(fullPath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    const existing = new Set(
      current
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    );

    const additions = lines.filter((line) => !existing.has(line));
    if (!additions.length) return;

    const next =
      current +
      (current && !current.endsWith('\n') ? '\n' : '') +
      additions.join('\n') +
      '\n';

    if (dryRun) return;
    await fs.writeFile(fullPath, next, 'utf8');
  }

  async function addDependencies(dependencies = []) {
    if (!dependencies.length) return;

    await upsertJson('package.json', (pkg) => {
      pkg.dependencies ||= {};
      for (const dep of dependencies) {
        if (!pkg.dependencies[dep] && !(pkg.devDependencies && pkg.devDependencies[dep])) {
          pkg.dependencies[dep] = 'latest';
        }
      }
      return pkg;
    });
  }

  async function addDevDependencies(dependencies = []) {
    if (!dependencies.length) return;

    await upsertJson('package.json', (pkg) => {
      pkg.devDependencies ||= {};
      for (const dep of dependencies) {
        if (!pkg.devDependencies[dep] && !(pkg.dependencies && pkg.dependencies[dep])) {
          pkg.devDependencies[dep] = 'latest';
        }
      }
      return pkg;
    });
  }

  async function updateManifest(mutator) {
    const latest = (await loadManifest(projectRoot)) || manifest;
    const next = await mutator(structuredClone(latest));

    if (!dryRun) {
      await saveManifest(projectRoot, next);
    }

    return next;
  }

  function getFeatureConfig(featureName) {
    return manifest.featureConfig?.[featureName] || {};
  }

  async function updateFeatureConfig(featureName, updater) {
    const latest = (await loadManifest(projectRoot)) || manifest;
    const current = latest.featureConfig?.[featureName] || {};
    const nextConfig = await updater(structuredClone(current));

    const nextManifest = {
      ...latest,
      featureConfig: {
        ...(latest.featureConfig || {}),
        [featureName]: nextConfig,
      },
    };

    if (!dryRun) {
      await saveManifest(projectRoot, nextManifest);
    }

    return nextConfig;
  }

  function log(message) {
    console.log(chalk.cyan(`• ${message}`));
  }

  function success(message) {
    console.log(chalk.green(`✔ ${message}`));
  }

  function warn(message) {
    console.log(chalk.yellow(`⚠ ${message}`));
  }

  function run(command, options = {}) {
    if (dryRun) {
      log(`[dry-run] ${command}`);
      return;
    }

    execSync(command, {
      cwd: projectRoot,
      stdio: 'inherit',
      ...options,
    });
  }

  return {
    projectRoot,
    manifest,
    dryRun,
    resolvePath,
    ensureDir,
    writeFile,
    readJson,
    upsertJson,
    addEnv,
    addDependencies,
    addDevDependencies,
    updateManifest,
    getFeatureConfig,
    updateFeatureConfig,
    log,
    success,
    warn,
    run,
  };
}
```

---

## 4) `src/core/resolver.js`

This must be async because your registry is async.

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
        throw new Error(
          `Feature conflict: "${featureName}" is incompatible with "${blocked}"`
        );
      }
    }
  }
}
```

---

## 5) `src/core/preset.js`

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

## 6) `src/features/auth/index.js`

```js
export default {
  name: 'auth',
  title: 'Authentication',
  description: 'Authentication foundation for protected areas and user sessions.',
  category: 'platform',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [
    {
      name: 'provider',
      type: 'list',
      message: 'Choose an authentication provider',
      choices: [
        { name: 'Firebase Auth', value: 'firebase' },
        { name: 'Supabase Auth', value: 'supabase' },
        { name: 'Custom Auth', value: 'custom' },
      ],
      default: 'firebase',
    },
  ],
  install: async (ctx) => {
    const config = ctx.getFeatureConfig('auth');
    const provider = config.provider || 'firebase';

    await ctx.ensureDir('src/modules/auth');
    await ctx.writeFile(
      'src/modules/auth/index.js',
      `export const authModule = {
  enabled: true,
  provider: '${provider}',
};
`
    );

    await ctx.addEnv([
      'VITE_AUTH_ENABLED=true',
      `VITE_AUTH_PROVIDER=${provider}`,
    ]);
  },
};
```

---

## 7) `src/features/booking/index.js`

```js
export default {
  name: 'booking',
  title: 'Booking System',
  description: 'Appointments, scheduling, and booking workflows.',
  category: 'platform',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'visibility',
      type: 'list',
      message: 'Should the booking system be public or private?',
      choices: [
        { name: 'Public booking page', value: 'public' },
        { name: 'Private/internal booking only', value: 'private' },
      ],
      default: 'public',
    },
  ],
  install: async (ctx) => {
    const config = ctx.getFeatureConfig('booking');
    const visibility = config.visibility || 'public';

    await ctx.ensureDir('src/modules/booking');
    await ctx.writeFile(
      'src/modules/booking/index.js',
      `export const bookingModule = {
  enabled: true,
  version: 1,
  visibility: '${visibility}',
};
`
    );

    await ctx.addEnv([
      'VITE_BOOKING_ENABLED=true',
      `VITE_BOOKING_VISIBILITY=${visibility}`,
    ]);

    await ctx.addDependencies(['date-fns']);
  },
};
```

---

## 8) `src/features/notifications/index.js`

This version supports the options you wanted: email, WhatsApp, FCM, in-app, or combinations.

```js
export default {
  name: 'notifications',
  title: 'Notifications',
  description: 'Email, WhatsApp, FCM, and in-app notification foundation.',
  category: 'platform',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [
    {
      name: 'channels',
      type: 'checkbox',
      message: 'Select notification channels',
      choices: [
        { name: 'Email', value: 'email' },
        { name: 'WhatsApp', value: 'whatsapp' },
        { name: 'Firebase Cloud Messaging (FCM)', value: 'fcm' },
        { name: 'In-app notifications', value: 'in-app' },
      ],
      default: ['email'],
      validate(value) {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Select at least one notification channel.';
        }
        return true;
      },
    },
  ],
  install: async (ctx) => {
    const config = ctx.getFeatureConfig('notifications');
    const channels = Array.isArray(config.channels) && config.channels.length
      ? config.channels
      : ['email'];

    await ctx.ensureDir('src/modules/notifications');
    await ctx.writeFile(
      'src/modules/notifications/index.js',
      `export const notificationsModule = {
  enabled: true,
  channels: ${JSON.stringify(channels, null, 2)},
};
`
    );

    await ctx.addEnv([
      'VITE_NOTIFICATIONS_ENABLED=true',
      `VITE_NOTIFICATION_CHANNELS=${channels.join(',')}`,
    ]);
  },
};
```

---

## 9) `src/cli/commands/create.js`

This is the finalized prompt-aware create flow.

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
import { collectFeatureAnswers } from '../../core/feature-prompts.js';

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
          const optionalFeaturePool = (await listFeatures()).filter(
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

        const featureConfig = await collectFeatureAnswers(finalFeatureSet);

        if (!options.dryRun) {
          await ensureProjectRoot(projectRoot);
          await ensureBasePackageJson(projectRoot, projectName);

          const manifest = createDefaultManifest({
            name: projectName,
            stack: options.stack,
            preset: preset.name,
            features: [],
            featureConfig,
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

## 10) `src/cli/commands/add.js`

This final version asks only for missing feature config.

```js
import chalk from 'chalk';
import { installFeatures } from '../../core/installer.js';
import { loadManifest, saveManifest } from '../../core/manifest.js';
import { resolveFeatures } from '../../core/resolver.js';
import { collectFeatureAnswers } from '../../core/feature-prompts.js';

export function registerAddCommand(program) {
  program
    .command('add <featureNames...>')
    .description('Add one or more features to an existing project')
    .option('--dry-run', 'Preview without writing files')
    .action(async (featureNames, options) => {
      try {
        const projectRoot = process.cwd();
        const manifest = await loadManifest(projectRoot);

        if (!manifest) {
          throw new Error('No toti.project.json found. Run create first.');
        }

        const finalFeatures = await resolveFeatures([
          ...(manifest.features || []),
          ...featureNames,
        ]);

        const featureConfig = await collectFeatureAnswers(finalFeatures, {
          existingAnswers: manifest.featureConfig || {},
        });

        if (!options.dryRun) {
          await saveManifest(projectRoot, {
            ...manifest,
            featureConfig,
          });
        }

        const result = await installFeatures({
          projectRoot,
          featureNames,
          dryRun: !!options.dryRun,
        });

        console.log(chalk.green.bold('\nFeatures installed successfully.\n'));
        console.log(chalk.white(`Installed now: ${result.installed.join(', ') || 'none'}`));
        console.log(chalk.white(`All features: ${result.finalFeatures.join(', ')}\n`));
      } catch (error) {
        console.error(chalk.red.bold('\nAdd failed:'), error.message);
        process.exit(1);
      }
    });
}
```

---

## 11) `src/core/installer.js`

This also must use async resolver and keep manifest updates intact.

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

  const toInstall = finalFeatures.filter(
    (name) => !(manifest.features || []).includes(name)
  );

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

## 12) Resulting manifest shape

After create, your `toti.project.json` should now look like this:

```json
{
  "name": "afya-clinic",
  "framework": "vue",
  "stack": "vue-firebase",
  "preset": "booking-platform",
  "features": [
    "auth",
    "dashboard",
    "booking",
    "notifications"
  ],
  "featureConfig": {
    "auth": {
      "provider": "firebase"
    },
    "booking": {
      "visibility": "public"
    },
    "notifications": {
      "channels": ["email", "whatsapp"]
    }
  },
  "options": {
    "kind": "platform",
    "package": "booking"
  },
  "createdAt": "2026-03-13T00:00:00.000Z",
  "updatedAt": "2026-03-13T00:00:00.000Z"
}
```

---

## 13) Final test commands

Run these:

```bash
node bin/toti.js presets
node bin/toti.js features
node bin/toti.js create afya-clinic --preset booking-platform
node bin/toti.js add notifications
```

During create/add, it should now ask:

* auth provider
* booking visibility
* notification channels

---

## 14) One important note

If your `features.js`, `presets.js`, or `doctor.js` commands still use sync registry access, make sure they also use `await`. Otherwise the prompts system will be correct, but other commands can still misbehave.

The prompts layer itself is now finalized.
