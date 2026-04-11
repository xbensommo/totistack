import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

export async function initProjectConfig() {
  const spinner = ora('Initializing Totistack config...').start();

  try {
    const cwd = process.cwd();
    const configDir = path.join(cwd, 'src/config');
    await fs.ensureDir(configDir);

    // Check if already initialized
    if (await fs.pathExists(path.join(configDir, 'project.config.js'))) {
      spinner.warn('Config already exists. Skipping.');
      return;
    }

    // Create minimal config files
    await fs.writeFile(path.join(configDir, 'project.config.js'), 'export default { name: "my-project" };');
    await fs.writeFile(path.join(configDir, 'branding.config.js'), 'export default { colors: { primary: "#2E5B28" } };');
    await fs.writeFile(path.join(configDir, 'apps.config.js'), 'export default { apps: [] };');
    await fs.writeFile(path.join(configDir, 'features.config.js'), 'export default { features: [] };');
    await fs.writeFile(path.join(configDir, 'collections.config.js'), 'export default { collections: {} };');

    spinner.succeed(chalk.green('Totistack config initialized.'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to initialize config'));
    throw error;
  }
}