import inquirer from 'inquirer';

export async function promptBranding() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'Business / app name:',
      default: 'My Totistack App',
    },
    {
      type: 'input',
      name: 'primaryColor',
      message: 'Primary color (hex):',
      default: '#2E5B28',
      validate: (input) => /^#[0-9A-Fa-f]{6}$/.test(input) || 'Please enter a valid hex color',
    },
    {
      type: 'input',
      name: 'secondaryColor',
      message: 'Secondary color (hex):',
      default: '#2B75BC',
      validate: (input) => /^#[0-9A-Fa-f]{6}$/.test(input) || 'Please enter a valid hex color',
    },
    {
      type: 'input',
      name: 'fontSans',
      message: 'Sans-serif font (e.g., Jost, sans-serif):',
      default: 'Jost, sans-serif',
    },
    {
      type: 'input',
      name: 'fontSerif',
      message: 'Serif font (e.g., Playfair Display, serif):',
      default: 'Playfair Display, serif',
    },
  ]);

  return answers;
}