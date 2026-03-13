export default {
  name: 'booking',
  title: 'Booking System',
  description: 'Appointments, scheduling, and booking workflows.',
  category: 'platform',
  dependencies: ['auth', 'dashboard'],
  optionalDependencies: ['notifications'],
  incompatibleWith: [],
  prompts: [],
  install: async (ctx) => {
    await ctx.ensureDir('src/modules/booking');
    await ctx.writeFile(
      'src/modules/booking/index.js',
      `export const bookingModule = {
  enabled: true,
  version: 1,
};
`
    );

    await ctx.addEnv([
      'VITE_BOOKING_ENABLED=true',
    ]);

    await ctx.addDependencies(['date-fns']);
  },
};