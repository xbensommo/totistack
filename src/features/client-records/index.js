/**
 * @file client-records/index.js
 * @description Client records feature for protected records and access control.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/client-records');

function getVariantTemplateDir(scope) {
  return path.join(TEMPLATE_ROOT, scope);
}

export default {
  name: 'client-records',
  title: 'Client Records',
  description: 'Protected client record storage and access patterns.',
  category: 'operations',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'scope',
      type: 'list',
      message: 'Choose client records access scope',
      choices: [
        { name: 'Internal staff only', value: 'internal' },
        { name: 'Shared staff and client access', value: 'shared' },
      ],
      default: 'internal',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('client-records');
    const scope = config.scope || 'internal';
    const templateDir = getVariantTemplateDir(scope);

    await ctx.ensureDir('src/modules/client-records');

    await ctx.copyTemplate(templateDir, 'src/modules/client-records', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        clientRecordsScope: scope,
      },
    });

    await ctx.writeFile(
      'src/modules/client-records/index.js',
      `export { clientRecordsModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_CLIENT_RECORDS_ENABLED=true',
      `VITE_CLIENT_RECORDS_SCOPE=${scope}`,
    ]);
  },
};