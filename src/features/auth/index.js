/**
 * @file auth/index.js
 * @description Provider-aware authentication feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/auth');

/**
 * Returns dependency names required for a given auth provider.
 *
 * @param {string} provider - Auth provider identifier.
 * @returns {string[]} Runtime dependency names.
 */
function getProviderDependencies(provider) {
  switch (provider) {
    case 'firebase':
      return ['firebase'];
    case 'supabase':
      return ['@supabase/supabase-js'];
    case 'custom':
      return [];
    default:
      return [];
  }
}

/**
 * Resolves the template directory for a provider.
 *
 * @param {string} provider - Auth provider identifier.
 * @returns {string} Absolute template directory path.
 */
function getProviderTemplateDir(provider) {
  return path.join(TEMPLATE_ROOT, provider);
}

export default {
  name: 'auth',
  title: 'Authentication',
  description: 'Authentication foundation for protected areas and user sessions.',
  category: 'platform',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [
    {
      name: 'provider',
      type: 'list',
      message: 'Choose an authentication provider',
      choices: [
        { name: 'Firebase Auth', value: 'firebase' },
        { name: 'Supabase Auth', value: 'supabase' },
        { name: 'Custom Auth', value: 'custom' },
      ],
      default: 'firebase',
    },
  ],

  /**
   * Installs the auth feature using provider-specific templates.
   *
   * @param {Object} ctx - Installer context.
   * @returns {Promise<void>}
   */
  install: async (ctx) => {
    const config = ctx.getFeatureConfig('auth');
    const provider = config.provider || 'firebase';
    const templateDir = getProviderTemplateDir(provider);

    ctx.log(`Using auth provider: ${provider}`);

    await ctx.ensureDir('src/modules/auth');

    await ctx.copyTemplate(templateDir, 'src/modules/auth', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        authProvider: provider,
      },
      overwrite: false,
    });

    await ctx.writeFile(
      'src/modules/auth/index.js',
      `export { authModule } from './provider.js';
`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_AUTH_ENABLED=true',
      `VITE_AUTH_PROVIDER=${provider}`,
    ]);

    await ctx.addDependencies(getProviderDependencies(provider));

    await ctx.upsertJson('package.json', (pkg) => {
      pkg.scripts ||= {};
      pkg.scripts['auth:check'] ||= 'echo "Auth module ready"';
      return pkg;
    });
  },
};