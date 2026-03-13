export default {
  name: 'notifications',
  title: 'Notifications',
  description: 'Email, in-app, or messaging notification foundation.',
  category: 'platform',
  dependencies: [],
  optionalDependencies: [],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/notifications');
    await ctx.writeFile(
      'src/modules/notifications/index.js',
      `export const notificationsModule = {
  enabled: true,
};
`
    );
  },
};