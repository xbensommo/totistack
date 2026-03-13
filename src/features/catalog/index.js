/**
 * @file index.js
 * @description Catalog feature for Totistack.
 * @author Totisoft CC
 * @date 2026-03-13
 * @email info@totisoft.com
 */

import { defineFeature, writeFeatureConfig, appendReadmeSection } from '../_shared.js';

export default defineFeature({
  name: 'catalog',
  title: 'Catalog',
  description: 'Adds product or service catalog structure.',
  async install(ctx) {
    await ctx.runHook('beforeInstall', { feature: 'catalog' });

    await writeFeatureConfig(ctx, 'catalog', {
      type: 'mixed',
      search: true,
      filters: true,
    });

    await ctx.writeFile(
      'src/modules/catalog/index.js',
      `export const catalogConfig = {
  type: "mixed",
  search: true,
  filters: true
};
`
    );

    await appendReadmeSection(ctx, 'Catalog', [
      'Supports products, services, or hybrid listings.',
      'Add category tree, search indexing, and detail pages.',
      'Pair with payments for checkout or invoicing.',
    ]);

    ctx.addTask('Model catalog item schema');
    await ctx.runHook('afterInstall', { feature: 'catalog' });
  },
});