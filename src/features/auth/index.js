export default {
  name: 'auth',
  title: 'Authentication',
  description: 'Authentication foundation for protected areas and user sessions.',
  category: 'platform',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/auth');
    await ctx.writeFile(
      'src/modules/auth/index.js',
      `export const authModule = {
  enabled: true,
};
`
    );

    await ctx.addEnv([
      'VITE_AUTH_ENABLED=true',
    ]);
  },
};