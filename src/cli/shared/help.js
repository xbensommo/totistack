/**
 * @file CLI help and usage rendering helpers.
 */

import { logger } from '../../core/utils/logger.js';

/**
 * Prints top-level CLI usage information.
 *
 * @returns {void}
 */
export function printHelp() {
  logger.info('Totistack CLI');
  console.log(`
Usage:
  toti <command> [options]

Commands:
  create <project-name>   Create a new Totistack project
  add <type> <items...>   Add features, apps, or presets to an existing project
  list                    List apps, features, and presets
  doctor                  Validate local Totistack environment and project health
  presets                 List built-in presets
  features                List built-in features
  apps                    List built-in apps
  init                    Print initialization guidance

Common create options:
  --frontend vue
  --styling tailwind
  --features auth,rbac
  --apps dashboard
  --presets business-core
  --firebase true|false
  --firestore true|false
  --provider @xbensommo/shard-provider
  --app-name "My App"
  --primary-color "#2E5B28"
  --cwd ./target-folder
  --force
  --dry-run
  --skip-install
  --verbose

Examples:
  toti create acme-admin --presets business-core
  toti add feature analytics search
  toti doctor
  `.trim());
}
