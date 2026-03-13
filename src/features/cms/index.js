/**
 * @file index.js
 * @description CMS feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'cms',
  title: 'CMS',
  description: 'Adds editable content management structure.',
  async install(ctx) {
    await ctx.runHook('beforeInstall', { feature: 'cms' });

    await writeFeatureConfig(ctx, 'cms', {
      collections: ['pages', 'posts', 'media'],
      draftMode: true,
    });

    await ctx.writeFile(
      'src/modules/cms/index.js',
      `export const cmsCollections = ["pages", "posts", "media"];
export const cmsDraftMode = true;
`
    );

    await appendReadmeSection(ctx, 'CMS', [
      'Editable pages, posts, and media collections.',
      'Add slug validation, publish workflow, and rich content blocks.',
      'Use this before building final marketing/public pages.',
    ]);

    ctx.addTask('Define CMS collections and editor UI');
    await ctx.runHook('afterInstall', { feature: 'cms' });
  },
});