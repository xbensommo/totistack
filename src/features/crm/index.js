/**
 * @file crm/index.js
 * @description CRM feature for leads, clients, and pipeline management.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/crm');

function getVariantTemplateDir(type) {
  return path.join(TEMPLATE_ROOT, type);
}

export default {
  name: 'crm',
  title: 'CRM',
  description: 'Customer and lead management foundation for internal teams.',
  category: 'business',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['forms', 'notifications', 'whatsapp'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'type',
      type: 'list',
      message: 'Choose CRM type',
      choices: [
        { name: 'Lead pipeline CRM', value: 'pipeline' },
        { name: 'Client relationship CRM', value: 'client-management' },
      ],
      default: 'pipeline',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('crm');
    const type = config.type || 'pipeline';
    const templateDir = getVariantTemplateDir(type);

    await ctx.ensureDir('src/modules/crm');

    await ctx.copyTemplate(templateDir, 'src/modules/crm', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        crmType: type,
      },
    });

    await ctx.writeFile(
      'src/modules/crm/index.js',
      `export { crmModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_CRM_ENABLED=true',
      `VITE_CRM_TYPE=${type}`,
    ]);
  },
};