/**
 * @file index.js
 * @description Notifications feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

function normalizeChannels(channels) {
  const list = Array.isArray(channels) ? channels : [channels].filter(Boolean);
  return [...new Set(list.filter(Boolean))];
}

export default defineFeature({
  name: 'notifications',
  title: 'Notifications',
  description: 'Adds notification channels and delivery strategy.',
  prompts: [
    {
      type: 'multiselect',
      name: 'notifications.channels',
      message: 'Choose notification channels',
      choices: ['email', 'whatsapp', 'fcm', 'in-app', 'both'],
      initial: ['email'],
    },
  ],
  async install(ctx) {
    const rawChannels = ctx.answers?.notifications?.channels || ['email'];
    const channels = normalizeChannels(rawChannels);
    const usesBoth = channels.includes('both');

    await ctx.runHook('beforeInstall', { feature: 'notifications', channels });

    await writeFeatureConfig(ctx, 'notifications', {
      channels,
      email: usesBoth || channels.includes('email'),
      whatsapp: usesBoth || channels.includes('whatsapp'),
      fcm: channels.includes('fcm'),
      inApp: usesBoth || channels.includes('in-app'),
    });

    await ctx.writeFile(
      'src/modules/notifications/index.js',
      `export const notificationChannels = ${JSON.stringify(channels, null, 2)};
`
    );

    await appendReadmeSection(ctx, 'Notifications', [
      `Channels: ${channels.join(', ')}`,
      'Connect event-driven triggers such as new lead, booking, payment, or status change.',
      'Implement queueing, retries, and per-channel templates.',
    ]);

    ctx.addTask('Set notification event map and templates');
    await ctx.runHook('afterInstall', { feature: 'notifications', channels });
  },
});