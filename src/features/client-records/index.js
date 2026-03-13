export default {
  name: 'client-records',
  title: 'Client Records',
  description: 'Protected client record storage and access patterns.',
  category: 'operations',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/client-records');
    await ctx.writeFile(
      'src/modules/client-records/index.js',
      `export const clientRecordsModule = {
  enabled: true,
  secure: true,
};
`
    );

    await ctx.addEnv([
      'VITE_CLIENT_RECORDS_ENABLED=true',
    ]);
  },
};