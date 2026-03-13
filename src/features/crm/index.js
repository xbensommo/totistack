export default {
  name: 'crm',
  title: 'CRM',
  description: 'Customer and lead management foundation for internal teams.',
  category: 'business',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications', 'forms'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/crm');
    await ctx.writeFile(
      'src/modules/crm/index.js',
      `export const crmModule = {
  enabled: true,
  entities: ['leads', 'clients', 'activities'],
};
`
    );

    await ctx.addEnv([
      'VITE_CRM_ENABLED=true',
    ]);
  },
};