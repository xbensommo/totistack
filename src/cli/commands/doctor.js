import { runDoctor } from '../services/doctorService.js';

export function doctorCommand(program) {
  program
    .command('doctor')
    .description('Check system prerequisites for Totistack')
    .action(async () => {
      try {
        await runDoctor();
      } catch (error) {
        console.error('Doctor check failed:', error.message);
        process.exit(1);
      }
    });
}