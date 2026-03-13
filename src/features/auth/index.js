/**
 * @file index.js
 * @description Auth feature for Totistack with provider-specific templates.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

/**
 * @type {Record<string, { title: string, template: string, packages: string[] }>}
 */
const PROVIDERS = {
  firebase: {
    title: 'Firebase Authentication',
    template: 'features/auth/firebase',
    packages: ['firebase'],
  },
  supabase: {
    title: 'Supabase Auth',
    template: 'features/auth/supabase',
    packages: ['@supabase/supabase-js'],
  },
  custom: {
    title: 'Custom Auth',
    template: 'features/auth/custom',
    packages: [],
  },
};

export default defineFeature({
  name: 'auth',
  title: 'Authentication',
  description: 'Adds authentication scaffolding and provider selection.',
  prompts: [
    {
      type: 'select',
      name: 'auth.provider',
      message: 'Choose auth provider',
      choices: ['firebase', 'supabase', 'custom'],
      initial: 'firebase',
    },
  ],
  async install(ctx) {
    const providerName = ctx.answers?.auth?.provider || 'firebase';
    const provider = PROVIDERS[providerName] || PROVIDERS.firebase;
    const templatePath = ctx.resolveTemplate(provider.template);

    await ctx.runHook('beforeInstall', { feature: 'auth', provider: providerName });

    try {
      await ctx.copyTemplate(templatePath, '.');
    } catch {
      await ctx.writeFile(
        'src/auth/index.js',
        ctx.render(`/**
 * Generated auth entry.
 */
export const authProvider = "{{ answers.auth.provider }}";

export function createAuth() {
  return {
    provider: authProvider,
    login() {
      throw new Error("Implement login for " + authProvider);
    },
    logout() {
      throw new Error("Implement logout for " + authProvider);
    },
  };
}
`)
      );
    }

    await writeFeatureConfig(ctx, 'auth', {
      provider: providerName,
      packages: provider.packages,
    });

    await ctx.mergeJson('package.json', {
      dependencies: Object.fromEntries(provider.packages.map((name) => [name, 'latest'])),
    });

    await appendReadmeSection(ctx, 'Authentication', [
      `Provider: ${provider.title}`,
      'Configure environment variables before first run.',
      'Implement provider-specific guards, session storage, and route protection.',
    ]);

    ctx.addTask(`Configure auth provider: ${providerName}`);
    await ctx.runHook('afterInstall', { feature: 'auth', provider: providerName });
  },
});