/**
 * @file index.js
 * @description Booking feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'booking',
  title: 'Booking',
  description: 'Adds booking flows for private or public scheduling.',
  prompts: [
    {
      type: 'select',
      name: 'booking.visibility',
      message: 'Booking access type',
      choices: ['public', 'private'],
      initial: 'public',
    },
  ],
  async install(ctx) {
    const visibility = ctx.answers?.booking?.visibility || 'public';

    await ctx.runHook('beforeInstall', { feature: 'booking', visibility });

    await writeFeatureConfig(ctx, 'booking', {
      visibility,
      allowGuestBooking: visibility === 'public',
      requireLogin: visibility === 'private',
    });

    await ctx.writeFile(
      'src/modules/booking/index.js',
      `export const bookingConfig = ${JSON.stringify(
        {
          visibility,
          allowGuestBooking: visibility === 'public',
          requireLogin: visibility === 'private',
        },
        null,
        2
      )};\n`
    );

    await appendReadmeSection(ctx, 'Booking', [
      `Visibility: ${visibility}`,
      'Add appointment rules, slot generation, and booking confirmation handlers.',
      'Connect notifications after booking submission.',
    ]);

    ctx.addTask('Configure booking slots and business rules');
    await ctx.runHook('afterInstall', { feature: 'booking', visibility });
  },
});