/**
 * @file installer-context.js
 * @description Shared installation context and filesystem helpers for Totistack features, presets, and hooks.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import chalk from "chalk";
import { loadManifest, saveManifest } from "./manifest.js";
import {
  pathExists,
  renderTemplateString,
  renderTemplateFile as renderTemplateToFile,
  copyTemplateDirectory,
  copyTemplate as copyRawTemplate,
} from "./template-engine.js";
import { createHookSystem } from "./hooks.js";

/**
 * Check whether a value is a plain object.
 *
 * @param {*} value - Value to inspect.
 * @returns {boolean} True when value is a plain object.
 */
function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Deep merge two plain objects.
 *
 * Objects are merged recursively.
 * Arrays are combined uniquely for better compatibility with package-like JSON.
 * Primitive values are replaced by the source value.
 *
 * @param {*} target - Original value.
 * @param {*} source - Patch value.
 * @returns {*} Merged result.
 */
function deepMerge(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...new Set([...target, ...source])];
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    const output = { ...target };

    for (const [key, value] of Object.entries(source)) {
      output[key] = key in output ? deepMerge(output[key], value) : value;
    }

    return output;
  }

  return source;
}

/**
 * Safely clones JSON-safe data.
 *
 * @param {*} value - Value to clone.
 * @returns {*} Cloned value.
 */
function safeClone(value) {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

/**
 * Creates a reusable installer context for feature and preset installation.
 *
 * Supports:
 * - manifest-aware install flow
 * - answers/options flow
 * - hooks and post-install tasks
 * - template root resolution
 * - backward-compatible helper methods from older installer context API
 *
 * @param {object} params - Context parameters.
 * @param {string} [params.projectRoot] - Absolute project root path.
 * @param {string} [params.targetDir] - Absolute target directory alias.
 * @param {string} [params.templateRoot] - Absolute template root path.
 * @param {string} [params.projectName] - Target project name.
 * @param {Record<string, any>} [params.manifest={}] - Loaded project manifest.
 * @param {object|null} [params.preset=null] - Selected preset module.
 * @param {Array<object>} [params.features=[]] - Selected feature modules.
 * @param {Record<string, any>} [params.featureMap={}] - Feature map keyed by feature name.
 * @param {Record<string, any>} [params.answers={}] - Prompt answers.
 * @param {Record<string, any>} [params.options={}] - CLI options.
 * @param {boolean} [params.dryRun=false] - Whether filesystem writes should be skipped.
 * @param {object} [params.logger=console] - Logger implementation.
 * @returns {object} Installer context API.
 */
export function createInstallerContext({
  projectRoot,
  targetDir,
  templateRoot = path.resolve("templates"),
  projectName,
  manifest = {},
  preset = null,
  features = [],
  featureMap = {},
  answers = {},
  options = {},
  dryRun = false,
  logger = console,
} = {}) {
  const root = projectRoot || targetDir;

  if (!root) {
    throw new Error(
      'createInstallerContext requires either "projectRoot" or "targetDir".'
    );
  }

  const tasks = [];
  const hooks = createHookSystem();

  /**
   * Resolve a path inside the project root.
   *
   * @param {...string} parts - Relative path parts.
   * @returns {string} Absolute path.
   */
  function resolvePath(...parts) {
    return path.join(root, ...parts);
  }

  /**
   * Alias for compatibility with earlier code.
   *
   * @param {...string} parts - Relative path parts.
   * @returns {string} Absolute path.
   */
  function resolveTarget(...parts) {
    return resolvePath(...parts);
  }

  /**
   * Resolve a path inside the template root.
   *
   * @param {...string} parts - Relative path parts.
   * @returns {string} Absolute template path.
   */
  function resolveTemplate(...parts) {
    return path.join(templateRoot, ...parts);
  }

  /**
   * Returns merged render context.
   *
   * @param {Record<string, any>} [extra={}] - Extra render variables.
   * @returns {Record<string, any>} Render context.
   */
  function data(extra = {}) {
    const derivedProjectName =
      projectName ||
      answers.projectName ||
      manifest?.name ||
      path.basename(root);

    const derivedProjectSlug =
      answers.projectSlug ||
      manifest?.slug ||
      derivedProjectName ||
      path.basename(root);

    return {
      project: {
        name: derivedProjectName,
        slug: derivedProjectSlug,
        root,
      },
      projectName: derivedProjectName,
      projectRoot: root,
      templateRoot,
      preset,
      manifest,
      answers,
      options,
      features: featureMap,
      featureMap,
      selectedFeatures: features,
      dryRun,
      ...extra,
    };
  }

  /**
   * Logs an informational message.
   *
   * @param {string} message - Message text.
   * @returns {void}
   */
  function log(message) {
    if (typeof logger?.log === "function") {
      logger.log(chalk.cyan(`• ${message}`));
      return;
    }

    console.log(chalk.cyan(`• ${message}`));
  }

  /**
   * Logs a success message.
   *
   * @param {string} message - Message text.
   * @returns {void}
   */
  function success(message) {
    if (typeof logger?.log === "function") {
      logger.log(chalk.green(`✔ ${message}`));
      return;
    }

    console.log(chalk.green(`✔ ${message}`));
  }

  /**
   * Logs a warning message.
   *
   * @param {string} message - Message text.
   * @returns {void}
   */
  function warn(message) {
    if (typeof logger?.warn === "function") {
      logger.warn(chalk.yellow(`⚠ ${message}`));
      return;
    }

    console.log(chalk.yellow(`⚠ ${message}`));
  }

  /**
   * Registers an installer hook.
   *
   * @param {string} name - Hook name.
   * @param {Function} handler - Hook handler.
   * @returns {Function} Unsubscribe function.
   */
  function on(name, handler) {
    return hooks.on(name, handler);
  }

  /**
   * Runs an installer hook.
   *
   * @param {string} name - Hook name.
   * @param {*} [payload] - Hook payload.
   * @returns {Promise<any>} Hook result.
   */
  async function runHook(name, payload) {
    return hooks.run(name, payload, context);
  }

  /**
   * Adds a post-install task.
   *
   * @param {string} task - Task description.
   * @returns {void}
   */
  function addTask(task) {
    if (task) {
      tasks.push(task);
    }
  }

  /**
   * Ensures a directory exists.
   *
   * Accepts either:
   * - one relative string path
   * - multiple path segments
   *
   * @param {...string} parts - Directory path or path segments.
   * @returns {Promise<string>} Absolute directory path.
   */
  async function ensureDir(...parts) {
    const relativePath =
      parts.length <= 1 ? (parts[0] || ".") : path.join(...parts);

    const fullPath = resolvePath(relativePath);

    if (!dryRun) {
      await fs.mkdir(fullPath, { recursive: true });
    }

    return fullPath;
  }

  /**
   * Checks whether a project-relative path exists.
   *
   * @param {string} relativePath - Relative file or directory path.
   * @returns {Promise<boolean>} True if it exists.
   */
  async function exists(relativePath) {
    return pathExists(resolvePath(relativePath));
  }

  /**
   * Reads a UTF-8 file from the project.
   *
   * @param {string} relativePath - Relative file path.
   * @returns {Promise<string>} File contents.
   */
  async function readFile(relativePath) {
    return fs.readFile(resolvePath(relativePath), "utf8");
  }

  /**
   * Writes a UTF-8 file unless it already exists and overwrite is false.
   *
   * @param {string} relativePath - Relative output file path.
   * @param {string} content - File contents.
   * @param {object} [writeOptions={}] - Write options.
   * @param {boolean} [writeOptions.overwrite=false] - Whether to overwrite existing files.
   * @returns {Promise<boolean>} True if written, false if skipped.
   */
  async function writeFile(relativePath, content, { overwrite = false } = {}) {
    const fullPath = resolvePath(relativePath);
    const alreadyExists = await pathExists(fullPath);

    if (alreadyExists && !overwrite) {
      return false;
    }

    if (dryRun) {
      log(`[dry-run] write file -> ${relativePath}`);
      return true;
    }

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf8");
    return true;
  }

  /**
   * Writes a UTF-8 file only if it does not already exist.
   *
   * @param {string} relativePath - Relative output file path.
   * @param {string} content - File contents.
   * @returns {Promise<boolean>} True if written, false if skipped.
   */
  async function writeFileOnce(relativePath, content) {
    return writeFile(relativePath, content, { overwrite: false });
  }

  /**
   * Appends text to a UTF-8 file, creating it if needed.
   *
   * @param {string} relativePath - Relative file path.
   * @param {string} content - Content to append.
   * @returns {Promise<void>}
   */
  async function appendFile(relativePath, content) {
    const fullPath = resolvePath(relativePath);

    if (dryRun) {
      log(`[dry-run] append file -> ${relativePath}`);
      return;
    }

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.appendFile(fullPath, content, "utf8");
  }

  /**
   * Reads a JSON file from the project.
   *
   * @param {string} relativePath - Relative JSON file path.
   * @param {*} [fallback={}] - Fallback value when file is missing.
   * @returns {Promise<*>} Parsed JSON value.
   */
  async function readJson(relativePath, fallback = {}) {
    try {
      const raw = await fs.readFile(resolvePath(relativePath), "utf8");
      return JSON.parse(raw);
    } catch (error) {
      if (error?.code === "ENOENT") {
        return fallback;
      }

      return fallback;
    }
  }

  /**
   * Writes a JSON-serializable value to a file.
   *
   * @param {string} relativePath - Relative file path.
   * @param {*} value - JSON-serializable value.
   * @returns {Promise<void>}
   */
  async function writeJson(relativePath, value) {
    const fullPath = resolvePath(relativePath);

    if (dryRun) {
      log(`[dry-run] write json -> ${relativePath}`);
      return;
    }

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  }

  /**
   * Reads, updates, and writes a JSON file.
   *
   * @param {string} relativePath - Relative JSON file path.
   * @param {(current: any) => any|Promise<any>} updater - Update function.
   * @returns {Promise<any>} Updated JSON value.
   */
  async function upsertJson(relativePath, updater) {
    const current = await readJson(relativePath, {});
    const next = await updater(safeClone(current));

    if (!dryRun) {
      await writeJson(relativePath, next);
    }

    return next;
  }

  /**
   * Merge a patch object into an existing JSON file.
   *
   * @param {string} relativePath - Relative JSON file path.
   * @param {object} patch - Object patch to merge.
   * @returns {Promise<void>}
   */
  async function mergeJson(relativePath, patch) {
    const current = await readJson(relativePath, {});
    const next = deepMerge(current, patch);
    await writeJson(relativePath, next);
  }

  /**
   * Adds environment variable lines to `.env` if missing.
   *
   * @param {string[]} [lines=[]] - Environment variable lines.
   * @returns {Promise<void>}
   */
  async function addEnv(lines = []) {
    const fullPath = resolvePath(".env");
    let current = "";

    try {
      current = await fs.readFile(fullPath, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }

    const existing = new Set(
      current
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    );

    const additions = lines.filter((line) => !existing.has(line));

    if (!additions.length) {
      return;
    }

    const next =
      current +
      (current && !current.endsWith("\n") ? "\n" : "") +
      additions.join("\n") +
      "\n";

    if (dryRun) {
      log("[dry-run] update .env");
      return;
    }

    await fs.writeFile(fullPath, next, "utf8");
  }

  /**
   * Appends missing lines to any env-style file.
   *
   * @param {string} relativePath - Relative env file path.
   * @param {string[]} [lines=[]] - Lines to append if missing.
   * @returns {Promise<void>}
   */
  async function appendEnv(relativePath, lines = []) {
    if (!Array.isArray(lines) || lines.length === 0) {
      return;
    }

    let current = "";

    try {
      current = await fs.readFile(resolvePath(relativePath), "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }

    const existing = new Set(
      current
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    );

    const additions = lines.filter((line) => !existing.has(line));

    if (!additions.length) {
      return;
    }

    const next =
      current +
      (current && !current.endsWith("\n") ? "\n" : "") +
      additions.join("\n") +
      "\n";

    if (dryRun) {
      log(`[dry-run] append env -> ${relativePath}`);
      return;
    }

    await fs.mkdir(path.dirname(resolvePath(relativePath)), {
      recursive: true,
    });
    await fs.writeFile(resolvePath(relativePath), next, "utf8");
  }

  /**
   * Adds runtime dependencies to package.json.
   *
   * @param {string[]} [dependencies=[]] - Package names.
   * @returns {Promise<void>}
   */
  async function addDependencies(dependencies = []) {
    if (!dependencies.length) {
      return;
    }

    await upsertJson("package.json", (pkg) => {
      pkg.dependencies ||= {};

      for (const dep of dependencies) {
        if (
          !pkg.dependencies[dep] &&
          !(pkg.devDependencies && pkg.devDependencies[dep])
        ) {
          pkg.dependencies[dep] = "latest";
        }
      }

      return pkg;
    });
  }

  /**
   * Adds dev dependencies to package.json.
   *
   * @param {string[]} [dependencies=[]] - Package names.
   * @returns {Promise<void>}
   */
  async function addDevDependencies(dependencies = []) {
    if (!dependencies.length) {
      return;
    }

    await upsertJson("package.json", (pkg) => {
      pkg.devDependencies ||= {};

      for (const dep of dependencies) {
        if (
          !pkg.devDependencies[dep] &&
          !(pkg.dependencies && pkg.dependencies[dep])
        ) {
          pkg.devDependencies[dep] = "latest";
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
    const latest = (await loadManifest(root)) || manifest || {};
    const next = await mutator(safeClone(latest));

    if (!dryRun) {
      await saveManifest(root, next);
    }

    return next;
  }

  /**
   * Returns saved config for a specific feature from the manifest.
   *
   * @param {string} featureName - Feature identifier.
   * @returns {Record<string, any>} Feature config object.
   */
  function getFeatureConfig(featureName) {
    return manifest?.featureConfig?.[featureName] || {};
  }

  /**
   * Updates config for a specific feature inside the manifest.
   *
   * @param {string} featureName - Feature identifier.
   * @param {(current: Record<string, any>) => Record<string, any>|Promise<Record<string, any>>} updater - Update callback.
   * @returns {Promise<Record<string, any>>} Updated feature config.
   */
  async function updateFeatureConfig(featureName, updater) {
    const latest = (await loadManifest(root)) || manifest || {};
    const current = latest.featureConfig?.[featureName] || {};
    const nextConfig = await updater(safeClone(current));

    const nextManifest = {
      ...latest,
      featureConfig: {
        ...(latest.featureConfig || {}),
        [featureName]: nextConfig,
      },
    };

    if (!dryRun) {
      await saveManifest(root, nextManifest);
    }

    return nextConfig;
  }

  /**
   * Renders a text template string using variables.
   *
   * @param {string} content - Raw template string.
   * @param {Record<string, any>} [variables={}] - Extra template variables.
   * @returns {string} Rendered output.
   */
  function renderInlineTemplate(content, variables = {}) {
    return renderTemplateString(content, data(variables));
  }

  /**
   * Alias compatible with older class API.
   *
   * @param {string} content - Raw template string.
   * @param {Record<string, any>} [variables={}] - Extra template variables.
   * @returns {string} Rendered output.
   */
  function render(content, variables = {}) {
    return renderInlineTemplate(content, variables);
  }

  /**
   * Renders a single template file from source into a project-relative destination.
   *
   * @param {string} templateFilePath - Absolute source template file path.
   * @param {string} destinationRelativePath - Project-relative output file path.
   * @param {object} [renderOptions={}] - Render options.
   * @param {Record<string, any>} [renderOptions.variables={}] - Extra template variables.
   * @param {boolean} [renderOptions.overwrite=false] - Whether to overwrite existing output.
   * @returns {Promise<boolean>} True if written, false if skipped.
   */
  async function renderTemplateFile(
    templateFilePath,
    destinationRelativePath,
    { variables = {}, overwrite = false } = {}
  ) {
    const destinationFilePath = resolvePath(destinationRelativePath);

    if (dryRun) {
      log(`[dry-run] render template file -> ${destinationRelativePath}`);
      return true;
    }

    return renderTemplateToFile({
      templateFilePath,
      destinationFilePath,
      variables: data(variables),
      overwrite,
    });
  }

  /**
   * Alias for older API shape: renderTemplate(from, to, vars).
   *
   * @param {string} from - Absolute source template file path.
   * @param {string} to - Relative destination file path.
   * @param {Record<string, any>} [vars={}] - Extra template variables.
   * @returns {Promise<boolean>} True if written, false if skipped.
   */
  async function renderTemplate(from, to, vars = {}) {
    return renderTemplateFile(from, to, {
      variables: vars,
      overwrite: true,
    });
  }

  /**
   * Copies and renders a template directory into a project-relative destination directory.
   *
   * @param {string} templateDir - Absolute template directory path.
   * @param {string} [destinationRelativeDir="."] - Project-relative destination directory.
   * @param {object|Record<string, any>} [copyOptions={}] - Copy options or compatibility extra render data.
   * @param {Record<string, any>} [copyOptions.variables={}] - Template variables.
   * @param {boolean} [copyOptions.overwrite=false] - Whether to overwrite existing files.
   * @returns {Promise<string[]>} Array of written file paths.
   */
  async function copyTemplate(
    templateDir,
    destinationRelativeDir = ".",
    copyOptions = {}
  ) {
    const normalized =
      "variables" in copyOptions || "overwrite" in copyOptions
        ? copyOptions
        : { variables: copyOptions, overwrite: false };

    const { variables = {}, overwrite = false } = normalized;

    if (dryRun) {
      log(`[dry-run] copy template directory -> ${destinationRelativeDir}`);
      return [];
    }

    return copyTemplateDirectory({
      templateDir,
      destinationDir: resolvePath(destinationRelativeDir),
      variables: data(variables),
      overwrite,
    });
  }

  /**
   * Copies a file or directory into the project without rendering.
   *
   * @param {string} from - Absolute source path.
   * @param {string} [to="."] - Project-relative destination path.
   * @param {object} [copyOptions={}] - Copy options.
   * @param {boolean} [copyOptions.overwrite=true] - Whether to overwrite existing files.
   * @returns {Promise<void>}
   */
  async function copyRaw(from, to = ".", copyOptions = {}) {
    if (dryRun) {
      log(`[dry-run] copy raw -> ${to}`);
      return;
    }

    await copyRawTemplate(from, resolvePath(to), copyOptions);
  }

  /**
   * Compatibility alias for copying a single file without rendering.
   *
   * @param {string} sourcePath - Absolute source file path.
   * @param {string} destinationPath - Project-relative destination path.
   * @param {object} [copyOptions={}] - Copy options.
   * @returns {Promise<void>}
   */
  async function copyFile(sourcePath, destinationPath, copyOptions = {}) {
    await copyRaw(sourcePath, destinationPath, copyOptions);
  }

  /**
   * Compatibility alias for copying a raw directory without rendering.
   *
   * @param {string} sourceDir - Absolute source directory path.
   * @param {string} destinationDir - Project-relative destination path.
   * @param {object} [copyOptions={}] - Copy options.
   * @returns {Promise<void>}
   */
  async function copyDir(sourceDir, destinationDir, copyOptions = {}) {
    await copyRaw(sourceDir, destinationDir, copyOptions);
  }

  /**
   * Patches a text file using a transform callback.
   *
   * @param {string} relativePath - Relative file path.
   * @param {(content: string) => string} transformer - Transform function.
   * @returns {Promise<void>}
   */
  async function patchFile(relativePath, transformer) {
    const current = await readFile(relativePath);
    const next = transformer(current);

    if (typeof next !== "string") {
      throw new TypeError(
        `patchFile("${relativePath}") transformer must return a string`
      );
    }

    await writeFile(relativePath, next, { overwrite: true });
  }

  /**
   * Extends package.json using deep merge.
   *
   * @param {object} patch - Partial package.json object.
   * @returns {Promise<void>}
   */
  async function extendPackageJson(patch) {
    await mergeJson("package.json", patch);
  }

  /**
   * Runs a shell command in the project root.
   *
   * @param {string} command - Shell command.
   * @param {object} [execOptions={}] - Extra execSync options.
   * @returns {void}
   */
  function run(command, execOptions = {}) {
    if (dryRun) {
      log(`[dry-run] ${command}`);
      return;
    }

    execSync(command, {
      cwd: root,
      stdio: "inherit",
      ...execOptions,
    });
  }

  const context = {
    projectRoot: root,
    targetDir: root,
    templateRoot,
    projectName: projectName || answers.projectName || path.basename(root),
    manifest,
    preset,
    features,
    featureMap,
    answers,
    options,
    dryRun,
    logger,
    fs,
    path,
    tasks,
    hooks,

    data,
    on,
    runHook,
    addTask,

    resolvePath,
    resolveTarget,
    resolveTemplate,

    ensureDir,
    exists,
    readFile,
    writeFile,
    writeFileOnce,
    appendFile,

    readJson,
    writeJson,
    upsertJson,
    mergeJson,

    addEnv,
    appendEnv,
    addDependencies,
    addDevDependencies,

    updateManifest,
    getFeatureConfig,
    updateFeatureConfig,

    render,
    renderTemplateString: renderInlineTemplate,
    renderTemplate,
    renderTemplateFile,
    copyTemplate,
    copyRaw,
    copyFile,
    copyDir,

    patchFile,
    extendPackageJson,

    log,
    success,
    warn,
    run,
  };

  return context;
}

/**
 * Totistack installer context class wrapper.
 *
 * This class wraps the factory-based context so older class-style usage
 * continues to work without losing newer helper methods.
 */
export class InstallerContext {
  /**
   * @param {{
   *   projectRoot: string,
   *   targetDir?: string,
   *   templateRoot?: string,
   *   projectName?: string,
   *   manifest?: Record<string, any>,
   *   preset?: Record<string, any>,
   *   features?: Array<Record<string, any>>,
   *   featureMap?: Record<string, any>,
   *   answers?: Record<string, any>,
   *   options?: Record<string, any>,
   *   dryRun?: boolean,
   *   logger?: Console
   * }} options - Installer options.
   */
  constructor(options = {}) {
    const context = createInstallerContext(options);
    Object.assign(this, context);
  }

  /**
   * Absolute project file resolver.
   *
   * @param {...string} segments - Relative path parts.
   * @returns {string} Absolute file path.
   */
  resolve(...segments) {
    return this.resolvePath(...segments);
  }
}