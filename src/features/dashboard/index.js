/**
 * @file index.js
 * @description Dashboard feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'dashboard',
  title: 'Dashboard',
  description: 'Adds dashboard shell and stats widget placeholders.',
  async install(ctx) {
    await ctx.runHook('beforeInstall', { feature: 'dashboard' });

    await writeFeatureConfig(ctx, 'dashboard', {
      widgets: ['stats', 'activity', 'quick-actions'],
      layout: 'default',
    });

    await ctx.writeFile(
      'src/modules/dashboard/index.js',
      `export const dashboardWidgets = ["stats", "activity", "quick-actions"];
`
    );

    await appendReadmeSection(ctx, 'Dashboard', [
      'Use as internal app shell after auth is ready.',
      'Start with KPIs, activity feed, and shortcuts.',
      'This is usually the first real app-side screen.',
    ]);

    ctx.addTask('Design dashboard layout and route guards');
    await ctx.runHook('afterInstall', { feature: 'dashboard' });
  },
});