import inquirer from 'inquirer';
import { validateProjectName } from '../utils/validators.js';

export async function promptProjectDetails(defaultName = 'my-totistack-app') {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: defaultName,
      validate: validateProjectName,
    },
    {
      type: 'list',
      name: 'preset',
      message: 'Choose a preset (or custom):',
      choices: ['custom', 'business-core', 'service-business', 'commerce', 'internal-ops', 'crm-suite'],
      default: 'custom',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: ['npm', 'yarn', 'pnpm'],
      default: 'npm',
    },
    {
      type: 'list',
      name: 'frontend',
      message: 'Frontend framework:',
      choices: ['vue', 'react'],
      default: 'vue',
    },
    {
      type: 'confirm',
      name: 'useFirestore',
      message: 'Will this project use Firestore?',
      default: true,
    },
  ]);

  return answers;
}