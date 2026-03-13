export default {
  name: 'seo',
  title: 'SEO Foundation',
  description: 'Base SEO config, robots, sitemap hooks, and metadata utilities.',
  category: 'marketing',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/seo');
    await ctx.writeFile(
      'src/seo/index.js',
      `export const seoConfig = {
  siteName: '${ctx.manifest.name}',
  defaultTitle: '${ctx.manifest.name}',
  defaultDescription: 'Built with Totisoft composer.',
};
`
    );

    await ctx.upsertJson('package.json', (pkg) => {
      pkg.scripts ||= {};
      pkg.scripts['seo:check'] ||= 'echo "SEO checks placeholder"';
      return pkg;
    });
  },
};