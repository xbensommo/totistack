/**
 * @file prompt-engine.js
 * @description Prompt collection and execution engine for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import inquirer from "inquirer";

/**
 * Collect prompts from modules.
 *
 * @param {Array<object>} modules
 * @returns {Array<object>}
 */
export function collectPrompts(modules) {
  return modules
    .filter((m) => Array.isArray(m.prompts))
    .flatMap((m) => m.prompts);
}

/**
 * Run prompts and return answers.
 *
 * @param {Array<object>} modules
 * @param {object} existingAnswers
 * @returns {Promise<object>}
 */
export async function runPrompts(modules, existingAnswers = {}) {
  const prompts = collectPrompts(modules);

  if (!prompts.length) {
    return existingAnswers;
  }

  const answers = await inquirer.prompt(prompts);

  return {
    ...existingAnswers,
    ...answers,
  };
}