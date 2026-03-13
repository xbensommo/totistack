export default {
  name: 'cms',
  title: 'Content Management',
  description: 'Content management foundation for editable pages, sections, and publishing.',
  category: 'content',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/cms');
    await ctx.writeFile(
      'src/modules/cms/index.js',
      `export const cmsModule = {
  enabled: true,
  collections: ['pages', 'posts'],
};
`
    );

    await ctx.addEnv([
      'VITE_CMS_ENABLED=true',
    ]);
  },
};