import chalk from 'chalk';
import { listFeatures } from '../../core/registry.js';

export function registerFeaturesCommand(program) {
  program
    .command('features')
    .description('List available features')
    .action(async () => {
      const features = await listFeatures();

      console.log(chalk.cyan.bold('\nAvailable features:\n'));

      for (const feature of features) {
        console.log(chalk.white(`${feature.name}`));
        console.log(`  ${feature.title}`);
        console.log(`  ${feature.description}`);
        console.log(`  dependencies: ${(feature.dependencies || []).join(', ') || 'none'}`);
        console.log('');
      }
    });
}