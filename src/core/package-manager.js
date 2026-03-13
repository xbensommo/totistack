/**
 * @file package-manager.js
 * @description Package manager detection and install utilities.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import {spawn} from "node:child_process";

/**
 * Detect preferred package manager.
 *
 * @returns {"pnpm"|"bun"|"npm"}
 */
export function detectPackageManager() {
  if (process.env.npm_config_user_agent?.includes("pnpm")) {
    return "pnpm";
  }

  if (process.env.npm_config_user_agent?.includes("bun")) {
    return "bun";
  }

  return "npm";
}

/**
 * Run dependency installation.
 *
 * @param {string} cwd
 * @param {object} logger
 */
export function installDependencies(cwd, logger = console) {
  const manager = detectPackageManager();

  logger.info?.(`Installing dependencies using ${manager}...`);

  const cmd = manager === "bun"
    ? "bun"
    : manager;

  const args = manager === "bun"
    ? ["install"]
    : ["install"];

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: "inherit",
      shell: true,
    });

    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error("Dependency installation failed"));
    });
  });
}