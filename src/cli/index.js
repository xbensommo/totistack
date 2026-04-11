/**
 * @file index.js
 * @description CLI entry point with registry initialization
 * @date 2026-03-22
 * @author Totistack Team
 * @changes 
 * - Added registry loading before command execution
 * - Implemented dependency injection for core modules
 * - Added global error boundary
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { loadAllRegistries } from '../core/registry/index.js';
import { createCommand } from './commands/create.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { doctorCommand } from './commands/doctor.js';
import { presetsCommand } from './commands/presets.js';
import { featuresCommand } from './commands/features.js';
import { appsCommand } from './commands/apps.js';
import { initCommand } from './commands/init.js';
import { logger } from '../core/utils/logger.js';

/**
 * Initialize and run the CLI application
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If registry loading fails
 */
export async function runCLI() {
  const program = new Command();

  try {
    // Load all registries before any command executes
    logger.info('Loading Totistack registries...');
    await loadAllRegistries();
    logger.info('Registries loaded successfully');

    program
      .name('toti')
      .description('Totistack v2 – Modular business app scaffolder')
      .version('2.0.0');

    // Register commands with dependency injection
    createCommand(program);
    addCommand(program);
    listCommand(program);
    doctorCommand(program);
    presetsCommand(program);
    featuresCommand(program);
    appsCommand(program);
    initCommand(program);

    // Global error handler with proper formatting
    program.configureOutput({
      writeErr: (str) => process.stderr.write(chalk.red(str)),
    });

    await program.parseAsync(process.argv);
  } catch (error) {
    logger.error('Failed to initialize Totistack CLI:', error);
    console.error(chalk.red('\n❌ Fatal Error:'), error.message);
    process.exit(1);
  }
}