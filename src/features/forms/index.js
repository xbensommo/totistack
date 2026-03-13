/**
 * @file index.js
 * @description Forms feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'forms',
  title: 'Forms',
  description: 'Adds configurable form scaffolding and submission handling.',
  async install(ctx) {
    await ctx.runHook('beforeInstall', { feature: 'forms' });

    await writeFeatureConfig(ctx, 'forms', {
      validation: true,
      submissions: true,
      multiStep: true,
    });

    await ctx.writeFile(
      'src/modules/forms/index.js',
      `export const formsConfig = {
  validation: true,
  submissions: true,
  multiStep: true
};
`
    );

    await appendReadmeSection(ctx, 'Forms', [
      'Supports contact, intake, onboarding, and assessment forms.',
      'Add field schemas, validation rules, and submission actions.',
      'Integrates well with CRM, booking, and notifications.',
    ]);

    ctx.addTask('Create reusable form schema layer');
    await ctx.runHook('afterInstall', { feature: 'forms' });
  },
});