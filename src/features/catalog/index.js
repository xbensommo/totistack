export default {
  name: 'catalog',
  title: 'Product Catalog',
  description: 'Catalog foundation for products, categories, pricing, and listings.',
  category: 'commerce',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/catalog');
    await ctx.writeFile(
      'src/modules/catalog/index.js',
      `export const catalogModule = {
  enabled: true,
  version: 1,
};
`
    );

    await ctx.addEnv([
      'VITE_CATALOG_ENABLED=true',
    ]);
  },
};