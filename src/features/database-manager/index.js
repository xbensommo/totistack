import DatabaseManagerService from './services/database-manager-service.js';
import { defineFeatureContract } from '../../core/contracts/feature.contract.js';

export default defineFeatureContract({
  id: 'database-manager',
  name: 'database-manager',
  /**
   * Called by the Totistack core when this module is installed.
   * Rules enforced:
   *  - NO router.addRoute()  → routes registered via routes.js by the CLI
   *  - NO app.use(store)     → stores exported from stores/index.js
   *
   * @param {import('vue').App} app
   * @param {Record<string, unknown>} config
   */
  install(app, config = {}) {
    const service = new DatabaseManagerService(config);
    app.provide('databaseManagerService', service);
  }
}); 
