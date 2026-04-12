/**
 * @file apps/crm/index.js
 * @description Backward-compatible CRM barrel exports.
 *
 * This module is declarative. It does not self-register routes, stores, or providers.
 * The Totistack generated assembly layer discovers these exports at build time.
 */

export { default as manifest } from './app.manifest.js';
export { default as routes } from './routes.js';
export {
  createCrmService,
  useCrmService,
  CRM_COLLECTIONS,
  CRM_PIPELINE_STAGES,
} from './services/crmService.js';

export { default as crmLeads } from './collections/crm_leads.collection.js';
export { default as crmOpportunities } from './collections/crm_opportunities.collection.js';
export { default as crmActivities } from './collections/crm_activities.collection.js';
