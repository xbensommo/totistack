/**
 * @file dashboard/index.js
 * @description Dashboard feature for internal admin and staff experiences.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/dashboard');

function getVariantTemplateDir(layout) {
  return path.join(TEMPLATE_ROOT, layout);
}

export default {
  name: 'dashboard',
  title: 'Dashboard',
  description: 'Protected internal dashboard shell.',
  category: 'platform',
  dependencies: ['auth'],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [
    {
      name: 'layout',
      type: 'list',
      message: 'Choose dashboard layout style',
      choices: [
        { name: 'Sidebar dashboard', value: 'sidebar' },
        { name: 'Top navigation dashboard', value: 'topbar' },
      ],
      default: 'sidebar',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('dashboard');
    const layout = config.layout || 'sidebar';
    const templateDir = getVariantTemplateDir(layout);

    await ctx.ensureDir('src/modules/dashboard');

    await ctx.copyTemplate(templateDir, 'src/modules/dashboard', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        dashboardLayout: layout,
      },
    });

    await ctx.writeFile(
      'src/modules/dashboard/index.js',
      `export { dashboardModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_DASHBOARD_ENABLED=true',
      `VITE_DASHBOARD_LAYOUT=${layout}`,
    ]);
  },
};