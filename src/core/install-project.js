/**
 * @file install-project.js
 * @description Main project installation pipeline for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import fs from "node:fs/promises";
import path from "node:path";
import {createInstallerContext} from "./installer-context.js";
import {runHooks} from "./hooks.js";
import {runPrompts} from "./prompt-engine.js";
import {resolveFeatures} from "./module-resolver.js";
import {installDependencies} from "./package-manager.js";

/**
 * Install a Totistack project using the selected preset and features.
 *
 * Execution order:
 * 1. resolve features and dependencies
 * 2. collect prompts
 * 3. beforeInstall hooks
 * 4. preset install
 * 5. feature installs
 * 6. afterInstall hooks
 * 7. dependency installation
 *
 * @param {object} params - Installer parameters.
 * @param {string} params.projectName - Target project name.
 * @param {string} params.targetDir - Destination project directory.
 * @param {object|null} params.preset - Selected preset module.
 * @param {Array<string>} params.requestedFeatures - Requested feature names.
 * @param {Array<object>} params.registryFeatures - Registry feature modules.
 * @param {object} params.answers - Collected prompt answers.
 * @param {object} params.options - CLI options.
 * @param {object} params.logger - Logger implementation.
 * @returns {Promise<object>} Final installer context.
 */
export async function installProject({
  projectName,
  targetDir,
  preset = null,
  requestedFeatures = [],
  registryFeatures = [],
  answers = {},
  options = {},
  logger = console,
}) {
  const absoluteTargetDir = path.resolve(targetDir);
  await fs.mkdir(absoluteTargetDir, {recursive: true});

  const features = resolveFeatures(preset, requestedFeatures, registryFeatures);
  const modules = [preset, ...features].filter(Boolean);
  const finalAnswers = await runPrompts(modules, answers);

  const ctx = createInstallerContext({
    projectName,
    targetDir: absoluteTargetDir,
    preset,
    features,
    answers: finalAnswers,
    options,
    logger,
  });

  await runHooks(modules, "beforeInstall", ctx);

  if (preset && typeof preset.install === "function") {
    logger.info?.(`Installing preset: ${preset.name}`);
    await preset.install(ctx);
  }

  for (const feature of features) {
    if (typeof feature.install === "function") {
      logger.info?.(`Installing feature: ${feature.name}`);
      await feature.install(ctx);
    }
  }

  await runHooks(modules, "afterInstall", ctx);
  await installDependencies(absoluteTargetDir, logger);

  return ctx;
}