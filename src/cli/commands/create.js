import { createProjectService } from '../services/createProjectService.js';

export function createCommand(program) {
  program
    .command('create <project-name>')
    .description('Create a new Totistack project')
    .option('--preset <preset>', 'Use a predefined preset')
    .option('--no-interactive', 'Run in non-interactive mode (requires preset and all answers)')
    .action(async (projectName, options) => {
      try {
        await createProjectService(projectName, options);
      } catch (error) {
        console.error('Error creating project:', error.message);
        process.exit(1);
      }
    });
}