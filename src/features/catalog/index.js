/**
 * @file catalog/index.js
 * @description Product catalog feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/catalog');

function getVariantTemplateDir(mode) {
  return path.join(TEMPLATE_ROOT, mode);
}

export default {
  name: 'catalog',
  title: 'Product Catalog',
  description: 'Catalog foundation for products, categories, pricing, and listings.',
  category: 'commerce',
  dependencies: [],
  optionalDependencies: ['forms'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'mode',
      type: 'list',
      message: 'Choose catalog type',
      choices: [
        { name: 'Simple product catalog', value: 'simple' },
        { name: 'Inventory-aware catalog', value: 'inventory' },
      ],
      default: 'simple',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('catalog');
    const mode = config.mode || 'simple';
    const templateDir = getVariantTemplateDir(mode);

    await ctx.ensureDir('src/modules/catalog');

    await ctx.copyTemplate(templateDir, 'src/modules/catalog', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        catalogMode: mode,
      },
    });

    await ctx.writeFile(
      'src/modules/catalog/index.js',
      `export { catalogModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_CATALOG_ENABLED=true',
      `VITE_CATALOG_MODE=${mode}`,
    ]);
  },
};