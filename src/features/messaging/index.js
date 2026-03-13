export default {
  name: 'messaging',
  title: 'Messaging',
  description: 'Messaging hooks for email, WhatsApp, and customer communication flows.',
  category: 'communication',
  dependencies: [],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/messaging');
    await ctx.writeFile(
      'src/modules/messaging/index.js',
      `export const messagingModule = {
  enabled: true,
  channels: ['email', 'whatsapp'],
};
`
    );

    await ctx.addEnv([
      'VITE_MESSAGING_ENABLED=true',
    ]);
  },
};