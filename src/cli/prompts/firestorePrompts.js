import inquirer from 'inquirer';

export async function promptFirestore() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'firebaseProjectId',
      message: 'Firebase project ID:',
      validate: (input) => input.trim() !== '' || 'Project ID is required',
    },
    {
      type: 'input',
      name: 'firestoreCollectionPrefix',
      message: 'Firestore collection prefix (optional):',
      default: '',
    },
  ]);

  return answers;
}