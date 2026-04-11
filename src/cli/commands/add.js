import { installModulesService } from '../services/installModulesService.js';

export function addCommand(program) {
  program
    .command('add <module-type> <module-name>')
    .description('Add an app or feature to an existing project')
    .option('--interactive', 'Run in interactive mode to configure module')
    .action(async (moduleType, moduleName, options) => {
      try {
        await installModulesService(moduleType, moduleName, options);
      } catch (error) {
        console.error('Error adding module:', error.message);
        process.exit(1);
      }
    });
}