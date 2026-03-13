/**
 * @file index.js
 * @description Messaging feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'messaging',
  title: 'Messaging',
  description: 'Adds internal or external messaging scaffolding.',
  async install(ctx) {
    await ctx.runHook('beforeInstall', { feature: 'messaging' });

    await writeFeatureConfig(ctx, 'messaging', {
      channels: ['in-app'],
      inbox: true,
      threads: true,
    });

    await ctx.writeFile(
      'src/modules/messaging/index.js',
      `export const messagingChannels = ["in-app"];
`
    );

    await appendReadmeSection(ctx, 'Messaging', [
      'Use for inbox, staff messaging, or customer conversation threads.',
      'Pair with WhatsApp or email for omnichannel workflows.',
      'Define message ownership, read state, and notifications.',
    ]);

    ctx.addTask('Define messaging storage and thread model');
    await ctx.runHook('afterInstall', { feature: 'messaging' });
  },
});