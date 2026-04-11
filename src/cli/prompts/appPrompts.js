import inquirer from 'inquirer';

export async function promptApps(availableApps) {
  const choices = availableApps.map((app) => ({ name: app.name, value: app.id, checked: false }));
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'apps',
      message: 'Select apps to install:',
      choices,
    },
  ]);

  return answers.apps;
}