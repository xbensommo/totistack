import chalk from 'chalk';
import { execSync } from 'child_process';

export async function runDoctor() {
  console.log(chalk.blue('Checking system prerequisites...\n'));

  const checks = [
    { name: 'Node.js', command: 'node --version', expected: /v\d+\.\d+\.\d+/, required: true },
    { name: 'npm', command: 'npm --version', expected: /\d+\.\d+\.\d+/, required: false },
    { name: 'yarn', command: 'yarn --version', expected: /\d+\.\d+\.\d+/, required: false },
    { name: 'pnpm', command: 'pnpm --version', expected: /\d+\.\d+\.\d+/, required: false },
    { name: 'Git', command: 'git --version', expected: /git version/, required: true },
  ];

  for (const check of checks) {
    try {
      const output = execSync(check.command, { encoding: 'utf8', stdio: 'pipe' });
      console.log(`✅ ${check.name}: ${output.trim()}`);
    } catch (error) {
      if (check.required) {
        console.error(`❌ ${check.name} not found or not working. Please install ${check.name}.`);
        process.exit(1);
      } else {
        console.log(`⚠️  ${check.name} not found (optional)`);
      }
    }
  }

  console.log(chalk.green('\nAll system checks passed!'));
}