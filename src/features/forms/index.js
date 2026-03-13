export default {
  name: 'forms',
  title: 'Forms Engine',
  description: 'Reusable forms for enquiries, onboarding, and lead capture.',
  category: 'business',
  dependencies: [],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/forms');
    await ctx.writeFile(
      'src/modules/forms/index.js',
      `export const formsModule = {
  enabled: true,
  version: 1,
};
`
    );

    await ctx.addEnv([
      'VITE_FORMS_ENABLED=true',
    ]);
  },
};