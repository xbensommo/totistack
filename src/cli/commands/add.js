import chalk from 'chalk';
import { installFeatures } from '../../core/installer.js';
import { loadManifest, saveManifest } from '../../core/manifest.js';
import { resolveFeatures } from '../../core/resolver.js';
import { collectFeatureAnswers } from '../../core/feature-prompts.js';

export function registerAddCommand(program) {
  program
    .command('add <featureNames...>')
    .description('Add one or more features to an existing project')
    .option('--dry-run', 'Preview without writing files')
    .action(async (featureNames, options) => {
      try {
        const projectRoot = process.cwd();
        const manifest = await loadManifest(projectRoot);

        if (!manifest) {
          throw new Error('No toti.project.json found. Run create first.');
        }

        const finalFeatures = await resolveFeatures([
          ...(manifest.features || []),
          ...featureNames,
        ]);

        const featureConfig = await collectFeatureAnswers(finalFeatures, {
          existingAnswers: manifest.featureConfig || {},
        });

        if (!options.dryRun) {
          await saveManifest(projectRoot, {
            ...manifest,
            featureConfig,
          });
        }

        const result = await installFeatures({
          projectRoot,
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