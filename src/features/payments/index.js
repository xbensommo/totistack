/**
 * @file payments/index.js
 * @description Payments feature for checkout, invoices, and billing flows.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/payments');

function getVariantTemplateDir(provider) {
  return path.join(TEMPLATE_ROOT, provider);
}

function getProviderDependencies(provider) {
  switch (provider) {
    case 'stripe':
      return ['stripe'];
    case 'payfast':
      return [];
    case 'manual':
      return [];
    default:
      return [];
  }
}

export default {
  name: 'payments',
  title: 'Payments',
  description: 'Payment integration foundation for online checkout, invoices, and billing.',
  category: 'commerce',
  dependencies: ['auth'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'provider',
      type: 'list',
      message: 'Choose a payment provider',
      choices: [
        { name: 'Stripe', value: 'stripe' },
        { name: 'PayFast / manual regional flow', value: 'payfast' },
        { name: 'Manual payments', value: 'manual' },
      ],
      default: 'manual',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('payments');
    const provider = config.provider || 'manual';
    const templateDir = getVariantTemplateDir(provider);

    await ctx.ensureDir('src/modules/payments');

    await ctx.copyTemplate(templateDir, 'src/modules/payments', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        paymentsProvider: provider,
      },
    });

    await ctx.writeFile(
      'src/modules/payments/index.js',
      `export { paymentsModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_PAYMENTS_ENABLED=true',
      `VITE_PAYMENTS_PROVIDER=${provider}`,
    ]);

    await ctx.addDependencies(getProviderDependencies(provider));
  },
};