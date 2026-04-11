import chalk from 'chalk';

export async function publishHintsService(projectName) {
  console.log(chalk.green('\n✅ Next steps:'));
  console.log(`   cd ${projectName}`);
  console.log('   npm install  # or yarn/pnpm');
  console.log('   npm run dev  # start development server\n');
  console.log(chalk.blue('📚 Documentation: https://docs.totistack.dev'));
}