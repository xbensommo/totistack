/**
 * @file messaging/index.js
 * @description Messaging feature for communication channels and customer conversation flows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/messaging');

function getVariantTemplateDir(mode) {
  return path.join(TEMPLATE_ROOT, mode);
}

export default {
  name: 'messaging',
  title: 'Messaging',
  description: 'Messaging hooks for email, WhatsApp, and customer communication flows.',
  category: 'communication',
  dependencies: [],
  optionalDependencies: ['whatsapp'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'mode',
      type: 'list',
      message: 'Choose messaging mode',
      choices: [
        { name: 'Internal notifications', value: 'internal' },
        { name: 'Customer conversations', value: 'customer' },
      ],
      default: 'customer',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('messaging');
    const mode = config.mode || 'customer';
    const templateDir = getVariantTemplateDir(mode);

    await ctx.ensureDir('src/modules/messaging');

    await ctx.copyTemplate(templateDir, 'src/modules/messaging', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        messagingMode: mode,
      },
    });

    await ctx.writeFile(
      'src/modules/messaging/index.js',
      `export { messagingModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_MESSAGING_ENABLED=true',
      `VITE_MESSAGING_MODE=${mode}`,
    ]);
  },
};