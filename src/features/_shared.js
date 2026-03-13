/**
 * @file _shared.js
 * @description Shared helpers for Totistack feature modules.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

/**
 * Creates a standard feature definition.
 *
 * @param {{
 *   name: string,
 *   title: string,
 *   description: string,
 *   prompts?: Array<Record<string, any>>,
 *   install?: Function
 * }} definition
 * @returns {Record<string, any>}
 */
export function defineFeature(definition) {
  const {
    name,
    title,
    description,
    prompts = [],
    install = async () => {},
  } = definition;

  if (!name) throw new Error('Feature requires a "name".');

  return { name, title, description, prompts, install };
}

/**
 * Writes a simple generated feature config file.
 *
 * @param {import('../core/installer-context.js').InstallerContext} ctx
 * @param {string} featureName
 * @param {Record<string, any>} payload
 * @returns {Promise<void>}
 */
export async function writeFeatureConfig(ctx, featureName, payload) {
  await ctx.writeFile(
    `src/config/features/${featureName}.config.json`,
    `${JSON.stringify(payload, null, 2)}\n`
  );
}

/**
 * Adds a README section for a feature.
 *
 * @param {import('../core/installer-context.js').InstallerContext} ctx
 * @param {string} title
 * @param {string[]} lines
 * @returns {Promise<void>}
 */
export async function appendReadmeSection(ctx, title, lines) {
  const block = [
    '',
    `## ${title}`,
    '',
    ...lines.map((line) => `- ${line}`),
    '',
  ].join('\n');

  await ctx.appendFile('README.md', block);
}