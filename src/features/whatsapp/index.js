/**
 * @file whatsapp/index.js
 * @description WhatsApp integration feature for cloud API and messaging workflows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/whatsapp');

function getVariantTemplateDir(provider) {
  return path.join(TEMPLATE_ROOT, provider);
}

export default {
  name: 'whatsapp',
  title: 'WhatsApp Integration',
  description: 'WhatsApp integration hooks for cloud API, templates, and messaging flows.',
  category: 'communication',
  dependencies: [],
  optionalDependencies: ['messaging', 'notifications'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'provider',
      type: 'list',
      message: 'Choose WhatsApp integration type',
      choices: [
        { name: 'WhatsApp Cloud API', value: 'cloud-api' },
        { name: 'Webhook placeholder only', value: 'webhook' },
      ],
      default: 'cloud-api',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('whatsapp');
    const provider = config.provider || 'cloud-api';
    const templateDir = getVariantTemplateDir(provider);

    await ctx.ensureDir('src/modules/whatsapp');

    await ctx.copyTemplate(templateDir, 'src/modules/whatsapp', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        whatsappProvider: provider,
      },
    });

    await ctx.writeFile(
      'src/modules/whatsapp/index.js',
      `export { whatsappModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_WHATSAPP_ENABLED=true',
      `VITE_WHATSAPP_PROVIDER=${provider}`,
    ]);
  },
};