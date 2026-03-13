export default {
  name: 'dashboard',
  title: 'Dashboard',
  description: 'Protected internal dashboard shell.',
  category: 'platform',
  dependencies: ['auth'],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/dashboard');
    await ctx.writeFile(
      'src/modules/dashboard/index.js',
      `export const dashboardModule = {
  enabled: true,
};
`
    );
  },
};