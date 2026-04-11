import inquirer from 'inquirer';

export async function promptFeatures(availableFeatures) {
  const choices = availableFeatures.map((f) => ({ name: f.name, value: f.id, checked: false }));
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features to install:',
      choices,
    },
  ]);

  return answers.features;
}