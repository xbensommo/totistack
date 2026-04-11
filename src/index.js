import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { doctorCommand } from './commands/doctor.js';
import { presetsCommand } from './commands/presets.js';
import { featuresCommand } from './commands/features.js';
import { appsCommand } from './commands/apps.js';
import { initCommand } from './commands/init.js';

export async function runCLI() {
  const program = new Command();

  program
    .name('toti')
    .description('Totistack v2 – modular business app scaffolder')
    .version('2.0.0');

  // Register commands
  createCommand(program);
  addCommand(program);
  listCommand(program);
  doctorCommand(program);
  presetsCommand(program);
  featuresCommand(program);
  appsCommand(program);
  initCommand(program);

  // Global error handler
  program.configureOutput({
    writeErr: (str) => process.stderr.write(chalk.red(str)),
  });

  await program.parseAsync(process.argv);
}