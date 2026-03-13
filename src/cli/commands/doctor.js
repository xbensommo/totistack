import chalk from 'chalk';
import { loadManifest } from '../../core/manifest.js';
import { getFeature } from '../../core/registry.js';

export function registerDoctorCommand(program) {
  program
    .command('doctor')
    .description('Validate project manifest and installed feature metadata')
    .action(async () => {
      try {
        const manifest = await loadManifest(process.cwd());

        if (!manifest) {
          throw new Error('No toti.project.json found in current directory.');
        }

        const problems = [];

        for (const featureName of manifest.features || []) {
          const feature = await getFeature(featureName);
          if (!feature) {
            problems.push(`Unknown installed feature in manifest: ${featureName}`);
          }
        }

        if (problems.length) {
          console.log(chalk.red.bold('\nDoctor found problems:\n'));
          for (const issue of problems) {
            console.log(chalk.red(`- ${issue}`));
          }
          process.exit(1);
        }

        console.log(chalk.green.bold('\nDoctor check passed.\n'));
        console.log(chalk.white(`Project: ${manifest.name}`));
        console.log(chalk.white(`Preset: ${manifest.preset || 'none'}`));
        console.log(chalk.white(`Features: ${(manifest.features || []).join(', ') || 'none'}\n`));
      } catch (error) {
        console.error(chalk.red.bold('\nDoctor failed:'), error.message);
        process.exit(1);
      }
    });
}