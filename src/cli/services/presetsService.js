import chalk from 'chalk';

export async function listPresets() {
  console.log(chalk.blue('\nAvailable presets:\n'));
  console.log('  - business-core      (CRM, forms, dashboard + auth, rbac, analytics)');
  console.log('  - service-business   (Booking, messaging, payments + auth, notifications)');
  console.log('  - commerce           (Catalog, payments, CMS + auth, search, analytics)');
  console.log('  - internal-ops       (CRM, CMS, workflows + auth, rbac, audit-logs)');
  console.log('  - crm-suite          (CRM, messaging, dashboard + auth, rbac, analytics, workflows)');
}