import { Command } from 'commander';
import { registerCreateCommand } from './commands/create.js';
import { registerAddCommand } from './commands/add.js';
import { registerFeaturesCommand } from './commands/features.js';
import { registerPresetsCommand } from './commands/presets.js';
import { registerDoctorCommand } from './commands/doctor.js';

export function createCli() {
  const program = new Command();

  program
    .name('toti')
    .description('Totisoft project composer CLI')
    .version('1.0.0');

  registerCreateCommand(program);
  registerAddCommand(program);
  registerFeaturesCommand(program);
  registerPresetsCommand(program);
  registerDoctorCommand(program);

  return program;
}