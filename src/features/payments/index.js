export default {
  name: 'payments',
  title: 'Payments',
  description: 'Payment integration foundation for online checkout, invoices, and billing.',
  category: 'commerce',
  dependencies: ['auth'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/payments');
    await ctx.writeFile(
      'src/modules/payments/index.js',
      `export const paymentsModule = {
  enabled: true,
  providers: [],
};
`
    );

    await ctx.addEnv([
      'VITE_PAYMENTS_ENABLED=true',
    ]);
  },
};