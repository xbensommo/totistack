import chalk from 'chalk';

export async function listApps() {
  console.log(chalk.blue('\nAvailable apps:\n'));
  console.log('  - booking-platform   Appointment scheduling, services, staff');
  console.log('  - crm                Customer relationship management');
  console.log('  - cms                Content management system');
  console.log('  - forms              Form builder and submissions');
  console.log('  - messaging          Internal messaging and chat');
  console.log('  - dashboard          Admin dashboard with widgets');
  console.log('  - payments           Payment processing integration');
  console.log('  - notifications      Notification center');
  console.log('  - catalog            Product catalog');
  console.log('  - whatsapp           WhatsApp integration');
  console.log('  - client-records     Client records management');
}