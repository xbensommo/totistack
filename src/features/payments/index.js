/**
 * @file index.js
 * @description Payments feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'payments',
  title: 'Payments',
  description: 'Adds payment domain scaffolding.',
  async install(ctx) {
    await ctx.runHook('beforeInstall', { feature: 'payments' });

    await writeFeatureConfig(ctx, 'payments', {
      invoices: true,
      transactions: true,
      gateway: 'manual',
    });

    await ctx.writeFile(
      'src/modules/payments/index.js',
      `export const paymentsConfig = {
  invoices: true,
  transactions: true,
  gateway: "manual"
};
`
    );

    await appendReadmeSection(ctx, 'Payments', [
      'Start with invoice and transaction records before gateway integration.',
      'Add webhooks, statuses, refunds, and reconciliation later.',
      'Works with booking, catalog, and CRM.',
    ]);

    ctx.addTask('Choose payment gateway and transaction model');
    await ctx.runHook('afterInstall', { feature: 'payments' });
  },
});