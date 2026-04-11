import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, './../../templates/project/base/vue');

/**
 * Writes the generated project files to disk.
 * In the real implementation, this would use core generators.
 * @param {object} config - Project configuration.
 */
export async function writeProjectFilesService(config) {
  const projectPath = path.join(process.cwd(), config.name);
  const templatePath = TEMPLATES_DIR;

  // Ensure destination directory exists and is empty
  await fs.ensureDir(projectPath);
  const existingFiles = await fs.readdir(projectPath);
  if (existingFiles.length > 0) {
    throw new Error(`Directory ${config.name} is not empty. Aborting.`);
  }

  // Copy base template
  await fs.copy(templatePath, projectPath);

  // TODO: Generate additional files from apps/features, handle config files, etc.
  // For now, just create a placeholder file to show success.
  await fs.writeFile(path.join(projectPath, 'README.md'), `# ${config.name}\n\nGenerated with Totistack v2.`);

  // Write branding.config.js
  const brandingConfig = `
export default {
  colors: {
    primary: '${config.branding.primaryColor}',
    secondary: '${config.branding.secondaryColor}',
  },
  fonts: {
    sans: '${config.branding.fontSans}',
    serif: '${config.branding.fontSerif}',
  },
};
`;
  await fs.writeFile(path.join(projectPath, 'src/config/branding.config.js'), brandingConfig);

  // Write project.config.js
  const projectConfig = `
export default {
  name: '${config.name}',
  frontend: '${config.frontend}',
  apps: ${JSON.stringify(config.apps, null, 2)},
  features: ${JSON.stringify(config.features, null, 2)},
  firestore: ${JSON.stringify(config.firestore, null, 2)},
};
`;
  await fs.writeFile(path.join(projectPath, 'src/config/project.config.js'), projectConfig);

  // Install dependencies (optional, maybe run in background)
  // For now, we'll just log a hint
  console.log('Project files written. Run `npm install` to install dependencies.');
}