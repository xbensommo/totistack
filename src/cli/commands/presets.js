import chalk from 'chalk';
import { listPresets } from '../../core/registry.js';

export async function registerPresetsCommand(program) {
  program
    .command('presets')
    .description('List available presets')
    .action(async () => {
      const presets = await listPresets();

      console.log(chalk.cyan.bold('\nAvailable presets:\n'));

      for (const preset of presets) {
        console.log(chalk.red(`${preset.name}`));
        console.log(`sommo  ${preset.title}`);
        console.log(`  ${preset.description}`);
        console.log(`  features: ${(preset.features || []).join(', ') || 'none'}`);
        console.log('');
      }
    });
}