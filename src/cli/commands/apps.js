import { listApps } from '../services/appsService.js';

export function appsCommand(program) {
  program
    .command('apps')
    .description('List available apps')
    .action(async () => {
      try {
        await listApps();
      } catch (error) {
        console.error('Error listing apps:', error.message);
        process.exit(1);
      }
    });
}