import { listFeatures } from '../services/featuresService.js';

export function featuresCommand(program) {
  program
    .command('features')
    .description('List available features')
    .action(async () => {
      try {
        await listFeatures();
      } catch (error) {
        console.error('Error listing features:', error.message);
        process.exit(1);
      }
    });
}