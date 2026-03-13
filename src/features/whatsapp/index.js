/**
 * @file index.js
 * @description WhatsApp feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'whatsapp',
  title: 'WhatsApp',
  description: 'Adds WhatsApp messaging integration scaffolding.',
  async install(ctx) {
    await ctx.runHook('beforeInstall', { feature: 'whatsapp' });

    await writeFeatureConfig(ctx, 'whatsapp', {
      provider: 'meta-cloud-api',
      templates: true,
      inboundWebhook: true,
    });

    await ctx.writeFile(
      'src/modules/whatsapp/index.js',
      `export const whatsappConfig = {
  provider: "meta-cloud-api",
  templates: true,
  inboundWebhook: true
};
`
    );

    await appendReadmeSection(ctx, 'WhatsApp', [
      'Use Meta Cloud API for outbound templates and inbound webhook handling.',
      'Add opt-in rules, delivery logging, and template mapping.',
      'Strong fit for booking reminders, lead follow-ups, and payment alerts.',
    ]);

    ctx.addTask('Configure WhatsApp credentials and webhook endpoint');
    await ctx.runHook('afterInstall', { feature: 'whatsapp' });
  },
});