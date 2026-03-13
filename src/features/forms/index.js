/**
 * @file forms/index.js
 * @description Forms feature for lead capture, onboarding, and custom workflows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/forms');

function getVariantTemplateDir(purpose) {
  return path.join(TEMPLATE_ROOT, purpose);
}

export default {
  name: 'forms',
  title: 'Forms Engine',
  description: 'Reusable forms for enquiries, onboarding, and lead capture.',
  category: 'business',
  dependencies: [],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'purpose',
      type: 'list',
      message: 'Choose forms purpose',
      choices: [
        { name: 'Lead capture forms', value: 'lead-capture' },
        { name: 'Onboarding forms', value: 'onboarding' },
      ],
      default: 'lead-capture',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('forms');
    const purpose = config.purpose || 'lead-capture';
    const templateDir = getVariantTemplateDir(purpose);

    await ctx.ensureDir('src/modules/forms');

    await ctx.copyTemplate(templateDir, 'src/modules/forms', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        formsPurpose: purpose,
      },
    });

    await ctx.writeFile(
      'src/modules/forms/index.js',
      `export { formsModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_FORMS_ENABLED=true',
      `VITE_FORMS_PURPOSE=${purpose}`,
    ]);
  },
};