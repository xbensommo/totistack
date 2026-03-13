/**
 * @file index.js
 * @description CRM feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'crm',
  title: 'CRM',
  description: 'Adds lead and pipeline management scaffolding.',
  async install(ctx) {
    await ctx.runHook('beforeInstall', { feature: 'crm' });

    await writeFeatureConfig(ctx, 'crm', {
      stages: ['new', 'qualified', 'proposal', 'won', 'lost'],
      owners: true,
      activities: true,
    });

    await ctx.writeFile(
      'src/modules/crm/index.js',
      `export const pipelineStages = ["new", "qualified", "proposal", "won", "lost"];
`
    );

    await appendReadmeSection(ctx, 'CRM', [
      'Lead stages, owners, follow-ups, and activity history.',
      'Connect forms for inbound leads and notifications for internal alerts.',
      'Extend with quotes, deals, and revenue tracking.',
    ]);

    ctx.addTask('Map CRM stages to your sales flow');
    await ctx.runHook('afterInstall', { feature: 'crm' });
  },
});