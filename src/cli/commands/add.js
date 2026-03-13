import chalk from 'chalk';
import { installFeatures } from '../../core/installer.js';

export function registerAddCommand(program) {
  program
    .command('add <featureNames...>')
    .description('Add one or more features to an existing project')
    .option('--dry-run', 'Preview without writing files')
    .action(async (featureNames, options) => {
      try {
        const result = await installFeatures({
          projectRoot: process.cwd(),
          featureNames,
          dryRun: !!options.dryRun,
        });

        console.log(chalk.green.bold('\nFeatures installed successfully.\n'));
        console.log(chalk.white(`Installed now: ${result.installed.join(', ') || 'none'}`));
        console.log(chalk.white(`All features: ${result.finalFeatures.join(', ')}\n`));
      } catch (error) {
        console.error(chalk.red.bold('\nAdd failed:'), error.message);
        process.exit(1);
      }
    });
}