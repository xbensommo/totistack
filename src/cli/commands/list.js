import { listAvailableModules } from '../services/listModulesService.js';

export function listCommand(program) {
  program
    .command('list')
    .description('List all available apps and features')
    .option('--apps', 'Show only apps')
    .option('--features', 'Show only features')
    .option('--presets', 'Show only presets')
    .action(async (options) => {
      try {
        await listAvailableModules(options);
      } catch (error) {
        console.error('Error listing modules:', error.message);
        process.exit(1);
      }
    });
}