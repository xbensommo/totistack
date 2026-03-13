/**
 * @file installer-context.js
 * @description Shared installation context and filesystem helpers for Totistack feature installers.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { loadManifest, saveManifest } from './manifest.js';
import {
  pathExists,
  renderTemplateString,
  renderTemplateFile,
  copyTemplateDirectory,
} from './template-engine.js';

/**
 * Creates a reusable installer context for feature installation.
 *
 * @param {Object} params - Context parameters.
 * @param {string} params.projectRoot - Absolute project root path.
 * @param {Record<string, any>} params.manifest - Loaded project manifest.
 * @param {boolean} [params.dryRun=false] - Whether filesystem changes should be skipped.
 * @returns {Object} Installer context API.
 */
export function createInstallerContext({ projectRoot, manifest, dryRun = false }) {
  /**
   * Resolves a path relative to the project root.
   *
   * @param {...string} parts - Relative path parts.
   * @returns {string} Absolute path.
   */
  function resolvePath(...parts) {
    return path.join(projectRoot, ...parts);
  }

  /**
   * Ensures a directory exists in the project.
   *
   * @param {string} relativePath - Relative directory path.
   * @returns {Promise<void>}
   */
  async function ensureDir(relativePath) {
    const fullPath = resolvePath(relativePath);
    if (dryRun) return;
    await fs.mkdir(fullPath, { recursive: true });
  }

  /**
   * Writes a file unless it already exists and overwrite is false.
   *
   * @param {string} relativePath - Relative output file path.
   * @param {string} content - File contents.
   * @param {Object} [options={}] - Write options.
   * @param {boolean} [options.overwrite=false] - Whether to overwrite existing files.
   * @returns {Promise<boolean>} True if written, false if skipped.
   */
  async function writeFile(relativePath, content, { overwrite = false } = {}) {
    const fullPath = resolvePath(relativePath);
    const alreadyExists = await pathExists(fullPath);

    if (alreadyExists && !overwrite) return false;
    if (dryRun) return true;

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
    return true;
  }

  /**
   * Reads a JSON file from the project.
   *
   * @param {string} relativePath - Relative JSON file path.
   * @param {Record<string, any>} [fallback={}] - Fallback value when file is missing.
   * @returns {Promise<Record<string, any>>} Parsed JSON object.
   */
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

  /**
   * Reads, updates, and writes a JSON file atomically.
   *
   * @param {string} relativePath - Relative JSON file path.
   * @param {(current: Record<string, any>) => Record<string, any>|Promise<Record<string, any>>} updater - Update function.
   * @returns {Promise<Record<string, any>>} Updated JSON object.
   */
  async function upsertJson(relativePath, updater) {
    const fullPath = resolvePath(relativePath);
    const current = await readJson(relativePath, {});
    const next = await updater(structuredClone(current));

    if (dryRun) return next;

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
    return next;
  }

  /**
   * Adds environment variable lines into `.env` if they do not already exist.
   *
   * @param {string[]} [lines=[]] - Environment variable lines.
   * @returns {Promise<void>}
   */
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

  /**
   * Adds runtime dependencies into `package.json`.
   *
   * @param {string[]} [dependencies=[]] - Package names.
   * @returns {Promise<void>}
   */
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

  /**
   * Adds development dependencies into `package.json`.
   *
   * @param {string[]} [dependencies=[]] - Package names.
   * @returns {Promise<void>}
   */
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

  /**
   * Updates the full project manifest.
   *
   * @param {(current: Record<string, any>) => Record<string, any>|Promise<Record<string, any>>} mutator - Mutator callback.
   * @returns {Promise<Record<string, any>>} Updated manifest.
   */
  async function updateManifest(mutator) {
    const latest = (await loadManifest(projectRoot)) || manifest;
    const next = await mutator(structuredClone(latest));

    if (!dryRun) {
      await saveManifest(projectRoot, next);
    }

    return next;
  }

  /**
   * Returns saved config for a specific feature.
   *
   * @param {string} featureName - Feature identifier.
   * @returns {Record<string, any>} Feature config object.
   */
  function getFeatureConfig(featureName) {
    return manifest.featureConfig?.[featureName] || {};
  }

  /**
   * Updates config for a specific feature inside the manifest.
   *
   * @param {string} featureName - Feature identifier.
   * @param {(current: Record<string, any>) => Record<string, any>|Promise<Record<string, any>>} updater - Update callback.
   * @returns {Promise<Record<string, any>>} Updated feature config.
   */
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

  /**
   * Renders a text template string using variables.
   *
   * @param {string} content - Raw template string.
   * @param {Record<string, any>} [variables={}] - Template variables.
   * @returns {string} Rendered output.
   */
  function renderTemplate(content, variables = {}) {
    return renderTemplateString(content, variables);
  }

  /**
   * Renders a single template file from a source path into a project-relative destination.
   *
   * @param {string} templateFilePath - Absolute source template file path.
   * @param {string} destinationRelativePath - Project-relative output file path.
   * @param {Object} [options={}] - Render options.
   * @param {Record<string, any>} [options.variables={}] - Template variables.
   * @param {boolean} [options.overwrite=false] - Whether to overwrite existing output.
   * @returns {Promise<boolean>} True if written, false if skipped.
   */
  async function renderTemplateFileToProject(
    templateFilePath,
    destinationRelativePath,
    { variables = {}, overwrite = false } = {}
  ) {
    const destinationFilePath = resolvePath(destinationRelativePath);

    if (dryRun) {
      log(`[dry-run] render template file -> ${destinationRelativePath}`);
      return true;
    }

    return renderTemplateFile({
      templateFilePath,
      destinationFilePath,
      variables,
      overwrite,
    });
  }

  /**
   * Copies and renders a whole template directory into a project-relative destination directory.
   *
   * @param {string} templateDir - Absolute template directory path.
   * @param {string} destinationRelativeDir - Project-relative destination directory.
   * @param {Object} [options={}] - Copy options.
   * @param {Record<string, any>} [options.variables={}] - Template variables.
   * @param {boolean} [options.overwrite=false] - Whether to overwrite existing files.
   * @returns {Promise<string[]>} Array of written file paths.
   */
  async function copyTemplate(
    templateDir,
    destinationRelativeDir,
    { variables = {}, overwrite = false } = {}
  ) {
    if (dryRun) {
      log(`[dry-run] copy template directory -> ${destinationRelativeDir}`);
      return [];
    }

    return copyTemplateDirectory({
      templateDir,
      destinationDir: resolvePath(destinationRelativeDir),
      variables,
      overwrite,
    });
  }

  /**
   * Logs an informational message.
   *
   * @param {string} message - Message text.
   * @returns {void}
   */
  function log(message) {
    console.log(chalk.cyan(`• ${message}`));
  }

  /**
   * Logs a success message.
   *
   * @param {string} message - Message text.
   * @returns {void}
   */
  function success(message) {
    console.log(chalk.green(`✔ ${message}`));
  }

  /**
   * Logs a warning message.
   *
   * @param {string} message - Message text.
   * @returns {void}
   */
  function warn(message) {
    console.log(chalk.yellow(`⚠ ${message}`));
  }

  /**
   * Runs a shell command in the project root.
   *
   * @param {string} command - Shell command.
   * @param {Object} [options={}] - Extra execSync options.
   * @returns {void}
   */
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
    renderTemplate,
    renderTemplateFile: renderTemplateFileToProject,
    copyTemplate,
    log,
    success,
    warn,
    run,
  };
}