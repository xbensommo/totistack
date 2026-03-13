the first version
# 1. Project manifest format

Create: `src/core/default-manifest.js`

```js
export function createDefaultManifest(overrides = {}) {
  return {
    name: '',
    framework: 'vue',
    stack: 'vue-firebase',
    preset: null,
    features: [],
    options: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
```

Create: `src/core/manifest.js`

```js
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
```

---

# 2. Feature contract

Every feature should export a standard object.

Create: `src/core/types.js`

```js
/**
 * Feature contract reference
 *
 * {
 *   name: string,
 *   title: string,
 *   description: string,
 *   category?: string,
 *   dependencies?: string[],
 *   optionalDependencies?: string[],
 *   incompatibleWith?: string[],
 *   prompts?: Array<Prompt>,
 *   install: async (ctx) => void,
 *   doctor?: async (ctx) => Array<string>
 * }
 *
 * Preset contract reference
 *
 * {
 *   name: string,
 *   title: string,
 *   description: string,
 *   features: string[],
 *   options?: object
 * }
 */
export {};
```

---

# 3. Registry format

Do not hardcode command logic per feature. Hardcode only the registry loading once.

Create: `src/features/seo/index.js`

```js
export default {
  name: 'seo',
  title: 'SEO Foundation',
  description: 'Base SEO config, robots, sitemap hooks, and metadata utilities.',
  category: 'marketing',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/seo');
    await ctx.writeFile(
      'src/seo/index.js',
      `export const seoConfig = {
  siteName: '${ctx.manifest.name}',
  defaultTitle: '${ctx.manifest.name}',
  defaultDescription: 'Built with Totisoft composer.',
};
`
    );

    await ctx.upsertJson('package.json', (pkg) => {
      pkg.scripts ||= {};
      pkg.scripts['seo:check'] ||= 'echo "SEO checks placeholder"';
      return pkg;
    });
  },
};
```

Create: `src/features/auth/index.js`

```js
export default {
  name: 'auth',
  title: 'Authentication',
  description: 'Authentication foundation for protected areas and user sessions.',
  category: 'platform',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/auth');
    await ctx.writeFile(
      'src/modules/auth/index.js',
      `export const authModule = {
  enabled: true,
};
`
    );

    await ctx.addEnv([
      'VITE_AUTH_ENABLED=true',
    ]);
  },
};
```

Create: `src/features/dashboard/index.js`

```js
export default {
  name: 'dashboard',
  title: 'Dashboard',
  description: 'Protected internal dashboard shell.',
  category: 'platform',
  dependencies: ['auth'],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/dashboard');
    await ctx.writeFile(
      'src/modules/dashboard/index.js',
      `export const dashboardModule = {
  enabled: true,
};
`
    );
  },
};
```

Create: `src/features/booking/index.js`

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

Create: `src/features/notifications/index.js`

```js
export default {
  name: 'notifications',
  title: 'Notifications',
  description: 'Email, in-app, or messaging notification foundation.',
  category: 'platform',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/notifications');
    await ctx.writeFile(
      'src/modules/notifications/index.js',
      `export const notificationsModule = {
  enabled: true,
};
`
    );
  },
};
```

---

# 4. Presets

Create: `src/presets/marketing-website.js`

```js
export default {
  name: 'marketing-website',
  title: 'Marketing Website',
  description: 'Lead-focused website with SEO and contact-ready structure.',
  features: ['seo'],
  options: {
    kind: 'website',
  },
};
```

Create: `src/presets/booking-platform.js`

```js
export default {
  name: 'booking-platform',
  title: 'Booking Platform',
  description: 'Booking-focused platform with auth and dashboard.',
  features: ['auth', 'dashboard', 'booking', 'notifications'],
  options: {
    kind: 'platform',
  },
};
```

Create: `src/presets/ecommerce-store.js`

```js
export default {
  name: 'ecommerce-store',
  title: 'E-commerce Store',
  description: 'Store foundation preset.',
  features: ['auth', 'dashboard'],
  options: {
    kind: 'store',
  },
};
```

---

# 5. Central registry

Create: `src/core/registry.js`

```js
import seo from '../features/seo/index.js';
import auth from '../features/auth/index.js';
import dashboard from '../features/dashboard/index.js';
import booking from '../features/booking/index.js';
import notifications from '../features/notifications/index.js';

import marketingWebsite from '../presets/marketing-website.js';
import bookingPlatform from '../presets/booking-platform.js';
import ecommerceStore from '../presets/ecommerce-store.js';

const featureList = [
  seo,
  auth,
  dashboard,
  booking,
  notifications,
];

const presetList = [
  marketingWebsite,
  bookingPlatform,
  ecommerceStore,
];

function assertUniqueNames(items, type) {
  const seen = new Set();

  for (const item of items) {
    if (seen.has(item.name)) {
      throw new Error(`Duplicate ${type} name detected: "${item.name}"`);
    }
    seen.add(item.name);
  }
}

assertUniqueNames(featureList, 'feature');
assertUniqueNames(presetList, 'preset');

export const featureRegistry = new Map(featureList.map((f) => [f.name, f]));
export const presetRegistry = new Map(presetList.map((p) => [p.name, p]));

export function getFeature(name) {
  return featureRegistry.get(name) || null;
}

export function getPreset(name) {
  return presetRegistry.get(name) || null;
}

export function listFeatures() {
  return [...featureRegistry.values()];
}

export function listPresets() {
  return [...presetRegistry.values()];
}
```

---

# 6. Resolver

This is the heart of the composer.

Create: `src/core/resolver.js`

```js
import { getFeature } from './registry.js';

export function resolveFeatures(inputFeatures = []) {
  const resolved = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(featureName, ancestry = []) {
    if (visited.has(featureName)) return;

    const feature = getFeature(featureName);
    if (!feature) {
      throw new Error(`Unknown feature: "${featureName}"`);
    }

    if (visiting.has(featureName)) {
      const cycle = [...ancestry, featureName].join(' -> ');
      throw new Error(`Circular dependency detected: ${cycle}`);
    }

    visiting.add(featureName);

    for (const dep of feature.dependencies || []) {
      visit(dep, [...ancestry, featureName]);
    }

    visiting.delete(featureName);
    visited.add(featureName);

    if (!resolved.includes(featureName)) {
      resolved.push(featureName);
    }
  }

  for (const featureName of inputFeatures) {
    visit(featureName);
  }

  validateIncompatibilities(resolved);

  return resolved;
}

export function validateIncompatibilities(featureNames) {
  for (const featureName of featureNames) {
    const feature = getFeature(featureName);
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

# 7. Installer context

Create: `src/core/installer-context.js`

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

    const next = current + (current && !current.endsWith('\n') ? '\n' : '') + additions.join('\n') + '\n';

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
    log,
    success,
    warn,
    run,
  };
}
```

---

# 8. Feature installer pipeline

Create: `src/core/installer.js`

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
  const finalFeatures = resolveFeatures(requested);

  const toInstall = finalFeatures.filter((name) => !(manifest.features || []).includes(name));

  const ctx = createInstallerContext({
    projectRoot,
    manifest,
    dryRun,
  });

  for (const featureName of toInstall) {
    const feature = getFeature(featureName);
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

# 9. Preset application

Create: `src/core/preset.js`

```js
import { getPreset } from './registry.js';
import { resolveFeatures } from './resolver.js';

export function resolvePreset(presetName) {
  const preset = getPreset(presetName);

  if (!preset) {
    throw new Error(`Unknown preset: "${presetName}"`);
  }

  return {
    ...preset,
    resolvedFeatures: resolveFeatures(preset.features || []),
  };
}
```

---

# 10. Project bootstrap helpers

Create: `src/core/project.js`

```js
import fs from 'fs/promises';
import path from 'path';

export async function ensureProjectRoot(projectRoot) {
  await fs.mkdir(projectRoot, { recursive: true });
}

export async function isNodeProject(projectRoot) {
  try {
    await fs.access(path.join(projectRoot, 'package.json'));
    return true;
  } catch {
    return false;
  }
}

export async function ensureBasePackageJson(projectRoot, projectName) {
  const pkgPath = path.join(projectRoot, 'package.json');

  try {
    await fs.access(pkgPath);
  } catch {
    const pkg = {
      name: projectName,
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {},
      devDependencies: {},
    };

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }
}
```

---

# 11. Commands

## `create`

Create: `src/cli/commands/create.js`

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
          const presets = listPresets();

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

        const preset = resolvePreset(presetName);

        if (!options.features) {
          const optionalFeaturePool = listFeatures()
            .filter((feature) => !preset.resolvedFeatures.includes(feature.name));

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

        const finalFeatureSet = resolveFeatures([
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

## `add`

Create: `src/cli/commands/add.js`

```js
import chalk from 'chalk';
import { installFeatures } from '../../core/installer.js';

export function registerAddCommand(program) {
  program
    .command('add <featureNames...>')
    .description('Add one or more features to an existing project')
    .option('--dry-run', 'Preview without writing files')
    .action(async (featureNames, options) => {
      try {
        const result = await installFeatures({
          projectRoot: process.cwd(),
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

## `features`

Create: `src/cli/commands/features.js`

```js
import chalk from 'chalk';
import { listFeatures } from '../../core/registry.js';

export function registerFeaturesCommand(program) {
  program
    .command('features')
    .description('List available features')
    .action(() => {
      const features = listFeatures();

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

## `presets`

Create: `src/cli/commands/presets.js`

```js
import chalk from 'chalk';
import { listPresets } from '../../core/registry.js';

export function registerPresetsCommand(program) {
  program
    .command('presets')
    .description('List available presets')
    .action(() => {
      const presets = listPresets();

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

## `doctor`

Create: `src/cli/commands/doctor.js`

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
          const feature = getFeature(featureName);
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

# 12. CLI index

Create: `src/cli/index.js`

```js
import { Command } from 'commander';
import { registerCreateCommand } from './commands/create.js';
import { registerAddCommand } from './commands/add.js';
import { registerFeaturesCommand } from './commands/features.js';
import { registerPresetsCommand } from './commands/presets.js';
import { registerDoctorCommand } from './commands/doctor.js';

export function createCli() {
  const program = new Command();

  program
    .name('toti')
    .description('Totisoft project composer CLI')
    .version('1.0.0');

  registerCreateCommand(program);
  registerAddCommand(program);
  registerFeaturesCommand(program);
  registerPresetsCommand(program);
  registerDoctorCommand(program);

  return program;
}
```

---

# 13. Bin entry

Create: `bin/toti.js`

```js
#!/usr/bin/env node
import { createCli } from '../src/cli/index.js';

createCli().parse(process.argv);
```

Then in `package.json`:

```json
{
  "bin": {
    "toti": "./bin/toti.js"
  }
}
```

---

# 14. Example result

Running:

```bash
toti create afya-clinic --preset booking-platform
```

Should result in:

* `package.json`
* `toti.project.json`
* `.env`
* `src/modules/auth/index.js`
* `src/modules/dashboard/index.js`
* `src/modules/booking/index.js`
* `src/modules/notifications/index.js`

And manifest like:

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
  "options": {
    "kind": "platform"
  },
  "createdAt": "2026-03-13T00:00:00.000Z",
  "updatedAt": "2026-03-13T00:00:00.000Z"
}
```

---

# 15. Why this is already better than the old design

This fixes the big architecture problems:

* features are declarative
* presets are business-driven
* dependency resolution is automatic
* manifest tracks project truth
* install pipeline is reusable
* `add booking` is now real composition, not file dumping

---

# 16. What you should add next

After this core works, the next layer should be:

1. **feature prompts**

   * booking asks public/private
   * auth asks firebase/supabase/custom
   * notifications asks email/whatsapp/both

2. **template copier**

   * structured module templates
   * file merge helpers

3. **hook system**

   * `beforeInstall`
   * `afterInstall`

4. **remove command**

   * harder than add, so do it later

5. **sync command**

   * regenerate derived files from manifest

6. **route registry**

   * later, when you start generating app areas

---

# 17. One important improvement I strongly recommend

Do **not** keep importing every feature manually forever.

After this MVP, upgrade registry loading to auto-discover `src/features/*/index.js` and `src/presets/*.js`.

For now, manual imports are fine because you need stability first.

---

# 18. Suggested install order for your next commit

Do this exactly in order:

1. manifest
2. registry
3. resolver
4. installer context
5. installer
6. create command
7. add command
8. features command
9. presets command
10. doctor command

That gives you a usable composer immediately.

If you want, next I’ll give you the **phase 2 code**:
**auto-discovery registry + feature prompts + template copy engine + sync command**.
