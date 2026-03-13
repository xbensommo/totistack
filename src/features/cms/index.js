/**
 * @file cms/index.js
 * @description CMS feature for editable content and publishing workflows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/cms');

function getVariantTemplateDir(mode) {
  return path.join(TEMPLATE_ROOT, mode);
}

export default {
  name: 'cms',
  title: 'Content Management',
  description: 'Content management foundation for editable pages, sections, and publishing.',
  category: 'content',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [
    {
      name: 'mode',
      type: 'list',
      message: 'Choose CMS mode',
      choices: [
        { name: 'Pages only', value: 'pages' },
        { name: 'Pages and blog posts', value: 'blog' },
      ],
      default: 'pages',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('cms');
    const mode = config.mode || 'pages';
    const templateDir = getVariantTemplateDir(mode);

    await ctx.ensureDir('src/modules/cms');

    await ctx.copyTemplate(templateDir, 'src/modules/cms', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        cmsMode: mode,
      },
    });

    await ctx.writeFile(
      'src/modules/cms/index.js',
      `export { cmsModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_CMS_ENABLED=true',
      `VITE_CMS_MODE=${mode}`,
    ]);
  },
};