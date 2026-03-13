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