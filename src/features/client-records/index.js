/**
 * @file index.js
 * @description Client records feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'client-records',
  title: 'Client Records',
  description: 'Adds client profile and record scaffolding.',
  async install(ctx) {
    await ctx.runHook('beforeInstall', { feature: 'client-records' });

    await writeFeatureConfig(ctx, 'client-records', {
      profile: true,
      notes: true,
      attachments: false,
      timeline: true,
    });

    await ctx.writeFile(
      'src/modules/client-records/index.js',
      `export const clientRecordFields = [
  "id",
  "name",
  "email",
  "phone",
  "status",
  "notes",
  "createdAt",
  "updatedAt"
];
`
    );

    await appendReadmeSection(ctx, 'Client Records', [
      'Set up profile, notes, status history, and internal timeline.',
      'Extend with attachments, case files, or medical/service history as needed.',
      'Works well with CRM, forms, and messaging.',
    ]);

    ctx.addTask('Define client records schema and permissions');
    await ctx.runHook('afterInstall', { feature: 'client-records' });
  },
});