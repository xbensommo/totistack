/**
 * @file booking/index.js
 * @description Provider-aware booking feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, '../../templates/features/booking');

function getVariantTemplateDir(visibility) {
  return path.join(TEMPLATE_ROOT, visibility);
}

export default {
  name: 'booking',
  title: 'Booking System',
  description: 'Appointments, scheduling, and booking workflows.',
  category: 'platform',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications', 'whatsapp'],
  incompatibleWith: [],
  prompts: [
    {
      name: 'visibility',
      type: 'list',
      message: 'Should the booking system be public or private?',
      choices: [
        { name: 'Public booking page', value: 'public' },
        { name: 'Private/internal booking only', value: 'private' },
      ],
      default: 'public',
    },
  ],

  install: async (ctx) => {
    const config = ctx.getFeatureConfig('booking');
    const visibility = config.visibility || 'public';
    const templateDir = getVariantTemplateDir(visibility);

    ctx.log(`Using booking visibility: ${visibility}`);

    await ctx.ensureDir('src/modules/booking');

    await ctx.copyTemplate(templateDir, 'src/modules/booking', {
      variables: {
        projectName: ctx.manifest.name || 'toti-app',
        bookingVisibility: visibility,
      },
    });

    await ctx.writeFile(
      'src/modules/booking/index.js',
      `export { bookingModule } from './module.js';\n`,
      { overwrite: true }
    );

    await ctx.addEnv([
      'VITE_BOOKING_ENABLED=true',
      `VITE_BOOKING_VISIBILITY=${visibility}`,
    ]);

    await ctx.addDependencies(['date-fns']);
  },
};