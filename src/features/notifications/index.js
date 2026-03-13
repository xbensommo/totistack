/**
 * @file notifications/index.js
 * @description Notifications feature for email, WhatsApp, FCM, and in-app channels.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { pathExists } from '../../core/template-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/notifications');

function getDependencyList(channels) {
  const deps = [];

  if (channels.includes('fcm')) deps.push('firebase');
  if (channels.includes('email')) deps.push('nodemailer');

  return deps;
}

export default {
  name: 'notifications',
  title: 'Notifications',
  description: 'Email, WhatsApp, FCM, and in-app notification foundation.',
  category: 'platform',
  dependencies: [],
  optionalDependencies: ['whatsapp'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'channels',
      type: 'checkbox',
      message: 'Select notification channels',
      choices: [
        { name: 'Email', value: 'email' },
        { name: 'WhatsApp', value: 'whatsapp' },
        { name: 'Firebase Cloud Messaging (FCM)', value: 'fcm' },
        { name: 'In-app notifications', value: 'in-app' },
      ],
      default: ['email'],
      validate(value) {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Select at least one notification channel.';
        }
        return true;
      },
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('notifications');
    const channels = Array.isArray(config.channels) && config.channels.length
      ? config.channels
      : ['email'];

    await ctx.ensureDir('src/modules/notifications');

    for (const channel of channels) {
      const channelDir = path.join(TEMPLATE_ROOT, channel);
      if (!(await pathExists(channelDir))) continue;

      await ctx.copyTemplate(channelDir, 'src/modules/notifications', {
        variables: {
          projectName: ctx.manifest.name || 'toti-app',
          notificationChannel: channel,
          notificationChannels: channels.join(','),
        },
      });
    }

    const exports = channels.map((channel) => {
      const safeName = channel.replace(/[^a-z0-9]/gi, '-');
      return `export * from './${safeName}.js';`;
    }).join('\n');

    await ctx.writeFile(
      'src/modules/notifications/index.js',
      `${exports}\n`,
      { overwrite: true }
    );

    await ctx.writeFile(
      'src/modules/notifications/module.js',
      `export const notificationsModule = {
  enabled: true,
  channels: ${JSON.stringify(channels, null, 2)},
};
`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_NOTIFICATIONS_ENABLED=true',
      `VITE_NOTIFICATION_CHANNELS=${channels.join(',')}`,
    ]);

    await ctx.addDependencies(getDependencyList(channels));
  },
};