import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { ensureProjectRoot, ensureBasePackageJson } from '../../core/project.js';
import { createDefaultManifest } from '../../core/default-manifest.js';
import { saveManifest } from '../../core/manifest.js';
import { listPresets, listFeatures } from '../../core/registry.js';
import { resolvePreset } from '../../core/preset.js';
import { resolveFeatures } from '../../core/resolver.js';
import { installFeatures } from '../../core/installer.js';

export function registerCreateCommand(program) {
  program
    .command('create <projectName>')
    .description('Create a new Totisoft project')
    .option('--preset <presetName>', 'Preset to use')
    .option('--features <items>', 'Comma-separated features')
    .option('--stack <stack>', 'Stack name', 'vue-firebase')
    .option('--dry-run', 'Preview without writing files')
    .action(async (projectName, options) => {
      try {
        const projectRoot = path.resolve(process.cwd(), projectName);

        let presetName = options.preset;
        let selectedFeatures = options.features
          ? options.features.split(',').map((item) => item.trim()).filter(Boolean)
          : [];

        if (!presetName) {
          const presets = await listPresets();

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'preset',
              message: 'Choose a project preset',
              choices: presets.map((preset) => ({
                name: `${preset.title} — ${preset.description}`,
                value: preset.name,
              })),
            },
          ]);

          presetName = answer.preset;
        }

        const preset = await resolvePreset(presetName);

        if (!options.features) {
          const allFeatures = await listFeatures();
          const optionalFeaturePool = allFeatures.filter(
            (feature) => !preset.resolvedFeatures.includes(feature.name)
          );

          const answer = await inquirer.prompt([
            {
              type: 'checkbox',
              name: 'extraFeatures',
              message: 'Select extra features',
              choices: optionalFeaturePool.map((feature) => ({
                name: `${feature.title} — ${feature.description}`,
                value: feature.name,
              })),
            },
          ]);

          selectedFeatures = answer.extraFeatures;
        }

        const finalFeatureSet = await resolveFeatures([
          ...preset.features,
          ...selectedFeatures,
        ]);

        if (!options.dryRun) {
          await ensureProjectRoot(projectRoot);
          await ensureBasePackageJson(projectRoot, projectName);

          const manifest = createDefaultManifest({
            name: projectName,
            stack: options.stack,
            preset: preset.name,
            features: [],
            options: preset.options || {},
          });

          await saveManifest(projectRoot, manifest);
        }

        const result = await installFeatures({
          projectRoot,
          featureNames: finalFeatureSet,
          dryRun: !!options.dryRun,
        });

        console.log(chalk.green.bold('\nProject created successfully.\n'));
        console.log(chalk.white(`Preset: ${preset.title}`));
        console.log(chalk.white(`Features: ${result.finalFeatures.join(', ')}`));
        console.log(chalk.white(`Location: ${projectRoot}\n`));
      } catch (error) {
        console.error(chalk.red.bold('\nCreate failed:'), error.message);
        process.exit(1);
      }
    });
}