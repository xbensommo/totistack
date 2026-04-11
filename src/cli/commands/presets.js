import { listPresets } from '../services/presetsService.js';

export function presetsCommand(program) {
  program
    .command('presets')
    .description('List available presets')
    .action(async () => {
      try {
        await listPresets();
      } catch (error) {
        console.error('Error listing presets:', error.message);
        process.exit(1);
      }
    });
}