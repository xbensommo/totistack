/**
 * @file template-engine.js
 * @description Lightweight template rendering and recursive copy utilities for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Default file extensions treated as text templates.
 *
 * Files with these extensions are rendered using template variables.
 * Other files are copied as-is.
 */
const DEFAULT_RENDER_EXTENSIONS = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".md",
  ".html",
  ".css",
  ".scss",
  ".vue",
  ".env",
  ".txt",
  ".yml",
  ".yaml",
  ".xml",
];

/**
 * Checks whether a file system path exists.
 *
 * @param {string} targetPath - Absolute or relative path to test.
 * @returns {Promise<boolean>} True if the path exists, otherwise false.
 */
export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures a directory exists.
 *
 * @param {string} directory - Absolute or relative directory path.
 * @returns {Promise<void>}
 */
export async function ensureDir(directory) {
  await fs.mkdir(directory, { recursive: true });
}

/**
 * Recursively lists all files under a directory.
 *
 * @param {string} directory - Root directory to traverse.
 * @returns {Promise<string[]>} Array of absolute file paths.
 */
export async function listFilesRecursive(directory) {
  const results = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await listFilesRecursive(fullPath)));
      continue;
    }

    if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Resolves a dot-notation value from an object.
 *
 * Example:
 * - getValue({ a: { b: 1 } }, "a.b") => 1
 *
 * @param {Record<string, any>} object - Source object.
 * @param {string} keyPath - Dot-notation key path.
 * @returns {any} Resolved value or undefined.
 */
function getValue(object, keyPath) {
  return String(keyPath)
    .split(".")
    .reduce((acc, part) => (acc == null ? undefined : acc[part]), object);
}

/**
 * Renders a string template using {{ key }} dot-notation tokens.
 *
 * Examples:
 * - {{ projectName }}
 * - {{ answers.authProvider }}
 * - {{ feature.config.provider }}
 *
 * Missing values render as empty strings.
 *
 * @param {string} template - Raw template content.
 * @param {Record<string, any>} [context={}] - Template variables.
 * @returns {string} Rendered content.
 */
export function renderString(template, context = {}) {
  return String(template).replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawKey) => {
    const value = getValue(context, rawKey.trim());
    return value == null ? "" : String(value);
  });
}

/**
 * Alias for renderString.
 *
 * @param {string} content - Raw template content.
 * @param {Record<string, any>} [variables={}] - Template variables.
 * @returns {string} Rendered content.
 */
export function renderTemplateString(content, variables = {}) {
  return renderString(content, variables);
}

/**
 * Alias for renderString for additional compatibility.
 *
 * @param {string} content - Raw template content.
 * @param {Record<string, any>} [variables={}] - Template variables.
 * @returns {string} Rendered content.
 */
export function interpolateTemplate(content, variables = {}) {
  return renderString(content, variables);
}

/**
 * Converts a template-relative file path into an output file path.
 *
 * Conventions:
 * - Files ending in `.txt` lose the `.txt` suffix.
 * - The remaining relative path is also template-rendered.
 *
 * Examples:
 * - `module.js.txt` -> `module.js`
 * - `firebase.config.json.txt` -> `firebase.config.json`
 * - `src/{{project.slug}}.js.txt` -> `src/my-app.js`
 *
 * @param {string} relativeTemplatePath - Relative path from template root.
 * @param {Record<string, any>} [variables={}] - Template variables.
 * @returns {string} Normalized output path.
 */
export function normalizeTemplateOutputPath(
  relativeTemplatePath,
  variables = {}
) {
  const renderedPath = renderString(relativeTemplatePath, variables);

  return renderedPath.endsWith(".txt")
    ? renderedPath.slice(0, -4)
    : renderedPath;
}

/**
 * Determines whether a file should be rendered as text.
 *
 * @param {string} filePath - Source file path.
 * @param {string[]} [renderExtensions=DEFAULT_RENDER_EXTENSIONS] - Renderable extensions.
 * @returns {boolean} True if the file should be rendered.
 */
function shouldRenderFile(
  filePath,
  renderExtensions = DEFAULT_RENDER_EXTENSIONS
) {
  return renderExtensions.includes(path.extname(filePath));
}

/**
 * Reads and renders a template file as a string.
 *
 * Old compatibility form:
 * - renderTemplateFile(sourcePath, context)
 *
 * New object form:
 * - renderTemplateFile({
 *     templateFilePath,
 *     destinationFilePath,
 *     variables,
 *     overwrite
 *   })
 *
 * Behavior:
 * - If called with `(sourcePath, context)`, returns rendered string.
 * - If called with object params, writes to destination and returns boolean.
 *
 * @param {string|object} input - Source path or object parameters.
 * @param {Record<string, any>} [context={}] - Render context for compatibility signature.
 * @returns {Promise<string|boolean>} Rendered string or write status.
 */
export async function renderTemplateFile(input, context = {}) {
  if (typeof input === "string") {
    const sourcePath = input;
    const content = await fs.readFile(sourcePath, "utf8");
    return renderString(content, context);
  }

  const {
    templateFilePath,
    destinationFilePath,
    variables = {},
    overwrite = false,
  } = input || {};

  if (!templateFilePath || !destinationFilePath) {
    throw new Error(
      'renderTemplateFile requires "templateFilePath" and "destinationFilePath".'
    );
  }

  const exists = await pathExists(destinationFilePath);

  if (exists && !overwrite) {
    return false;
  }

  const raw = await fs.readFile(templateFilePath, "utf8");
  const rendered = renderString(raw, variables);

  await ensureDir(path.dirname(destinationFilePath));
  await fs.writeFile(destinationFilePath, rendered, "utf8");

  return true;
}

/**
 * Writes a rendered template file to disk.
 *
 * @param {string} sourcePath - Absolute source template file path.
 * @param {string} destinationPath - Absolute destination file path.
 * @param {Record<string, any>} [context={}] - Template variables.
 * @param {object} [options={}] - Additional options.
 * @param {boolean} [options.overwrite=true] - Whether to overwrite an existing file.
 * @returns {Promise<boolean>} True if written, false if skipped.
 */
export async function renderFileTo(
  sourcePath,
  destinationPath,
  context = {},
  options = {}
) {
  const { overwrite = true } = options;

  return renderTemplateFile({
    templateFilePath: sourcePath,
    destinationFilePath: destinationPath,
    variables: context,
    overwrite,
  });
}

/**
 * Compatibility wrapper around renderTemplateFile.
 *
 * @param {string} src - Absolute source template file path.
 * @param {string} dest - Absolute destination file path.
 * @param {Record<string, any>} [vars={}] - Template variables.
 * @param {object} [options={}] - Additional options.
 * @param {boolean} [options.overwrite=true] - Whether to overwrite an existing file.
 * @returns {Promise<boolean>} True if written, false if skipped.
 */
export async function renderTemplate(src, dest, vars = {}, options = {}) {
  const { overwrite = true } = options;

  return renderTemplateFile({
    templateFilePath: src,
    destinationFilePath: dest,
    variables: vars,
    overwrite,
  });
}

/**
 * Copies a file without rendering.
 *
 * @param {string} sourcePath - Absolute source file path.
 * @param {string} destinationPath - Absolute destination file path.
 * @param {object} [options={}] - Copy options.
 * @param {boolean} [options.overwrite=true] - Whether to overwrite existing files.
 * @returns {Promise<void>}
 */
export async function copyFileTo(sourcePath, destinationPath, options = {}) {
  const { overwrite = true } = options;

  if (!overwrite && (await pathExists(destinationPath))) {
    return;
  }

  await ensureDir(path.dirname(destinationPath));
  await fs.copyFile(sourcePath, destinationPath);
}

/**
 * Copies a directory recursively without rendering.
 *
 * @param {string} sourceDir - Absolute source directory path.
 * @param {string} destinationDir - Absolute destination directory path.
 * @param {object} [options={}] - Copy options.
 * @param {boolean} [options.overwrite=true] - Whether to overwrite existing files.
 * @returns {Promise<void>}
 */
export async function copyDirectory(sourceDir, destinationDir, options = {}) {
  const files = await listFilesRecursive(sourceDir);

  for (const file of files) {
    const relative = path.relative(sourceDir, file);
    const target = path.join(destinationDir, relative);
    await copyFileTo(file, target, options);
  }
}

/**
 * Copies a file or directory recursively without rendering.
 *
 * This is the raw-copy helper used by installer-context.
 *
 * @param {string} src - Source file or directory path.
 * @param {string} dest - Destination file or directory path.
 * @param {object} [options={}] - Copy options.
 * @param {boolean} [options.overwrite=true] - Whether to overwrite existing files.
 * @returns {Promise<void>}
 */
export async function copyTemplate(src, dest, options = {}) {
  const { overwrite = true } = options;
  const stat = await fs.stat(src);

  if (stat.isDirectory()) {
    await ensureDir(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const from = path.join(src, entry.name);
      const to = path.join(dest, entry.name);
      await copyTemplate(from, to, options);
    }

    return;
  }

  if (!overwrite && (await pathExists(dest))) {
    return;
  }

  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

/**
 * Copies and renders all files inside a directory.
 *
 * All files are rendered as text templates.
 *
 * @param {string} sourceDir - Absolute template directory path.
 * @param {string} destinationDir - Absolute destination directory path.
 * @param {Record<string, any>} [context={}] - Template variables.
 * @param {object} [options={}] - Render options.
 * @param {boolean} [options.overwrite=true] - Whether to overwrite existing files.
 * @returns {Promise<string[]>} Written file paths.
 */
export async function renderDirectory(
  sourceDir,
  destinationDir,
  context = {},
  options = {}
) {
  const { overwrite = true } = options;
  const files = await listFilesRecursive(sourceDir);
  const writtenFiles = [];

  for (const file of files) {
    const relative = path.relative(sourceDir, file);
    const targetRelative = normalizeTemplateOutputPath(relative, context);
    const target = path.join(destinationDir, targetRelative);

    const written = await renderFileTo(file, target, context, { overwrite });

    if (written) {
      writtenFiles.push(target);
    }
  }

  return writtenFiles;
}

/**
 * Copies a directory, rendering template-like files and copying others raw.
 *
 * Supports both signatures:
 *
 * New object signature:
 * - copyTemplateDirectory({
 *     templateDir,
 *     destinationDir,
 *     variables,
 *     overwrite,
 *     renderExtensions
 *   })
 *
 * Old positional signature:
 * - copyTemplateDirectory(sourceDir, destinationDir, context, options)
 *
 * Notes:
 * - Relative output paths are rendered.
 * - Files ending in `.txt` lose the `.txt` suffix.
 *
 * @param {object|string} input - Object config or source directory path.
 * @param {string} [destinationDir] - Destination directory for positional form.
 * @param {Record<string, any>} [context={}] - Template variables for positional form.
 * @param {object} [options={}] - Extra options for positional form.
 * @returns {Promise<string[]>} Written or copied destination file paths.
 */
export async function copyTemplateDirectory(
  input,
  destinationDir,
  context = {},
  options = {}
) {
  let templateDir;
  let finalDestinationDir;
  let variables;
  let overwrite;
  let renderExtensions;

  if (typeof input === "string") {
    templateDir = input;
    finalDestinationDir = destinationDir;
    variables = context || {};
    overwrite = options.overwrite ?? false;
    renderExtensions =
      options.renderExtensions ?? DEFAULT_RENDER_EXTENSIONS;
  } else {
    templateDir = input?.templateDir;
    finalDestinationDir = input?.destinationDir;
    variables = input?.variables || {};
    overwrite = input?.overwrite ?? false;
    renderExtensions =
      input?.renderExtensions ?? DEFAULT_RENDER_EXTENSIONS;
  }

  if (!templateDir || !finalDestinationDir) {
    throw new Error(
      'copyTemplateDirectory requires "templateDir" and "destinationDir".'
    );
  }

  if (!(await pathExists(templateDir))) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  const files = await listFilesRecursive(templateDir);
  const writtenFiles = [];

  for (const sourceFilePath of files) {
    const relativePath = path.relative(templateDir, sourceFilePath);
    const outputRelativePath = normalizeTemplateOutputPath(
      relativePath,
      variables
    );
    const destinationFilePath = path.join(
      finalDestinationDir,
      outputRelativePath
    );

    if (shouldRenderFile(sourceFilePath, renderExtensions)) {
      const written = await renderTemplateFile({
        templateFilePath: sourceFilePath,
        destinationFilePath,
        variables,
        overwrite,
      });

      if (written) {
        writtenFiles.push(destinationFilePath);
      }

      continue;
    }

    if (!overwrite && (await pathExists(destinationFilePath))) {
      continue;
    }

    await copyFileTo(sourceFilePath, destinationFilePath, { overwrite });
    writtenFiles.push(destinationFilePath);
  }

  return writtenFiles;
}