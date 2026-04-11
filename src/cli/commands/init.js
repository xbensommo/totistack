import { initProjectConfig } from '../services/initService.js';

export function initCommand(program) {
  program
    .command('init')
    .description('Initialize Totistack config in an existing project')
    .action(async () => {
      try {
        await initProjectConfig();
      } catch (error) {
        console.error('Error initializing config:', error.message);
        process.exit(1);
      }
    });
}