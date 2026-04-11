import chalk from 'chalk';

export async function listFeatures() {
  console.log(chalk.blue('\nAvailable features:\n'));
  console.log('  - auth            User authentication');
  console.log('  - rbac            Role-based access control');
  console.log('  - media           Media management (images, files)');
  console.log('  - analytics       Analytics tracking');
  console.log('  - workflows       Workflow engine');
  console.log('  - search          Search integration');
  console.log('  - audit-logs      Activity logging');
  console.log('  - notifications   Email/push notifications');
}