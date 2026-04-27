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
  CRM_DOCUMENT_TYPES,
} from './services/crmService.js';

export { default as crmLeads } from './collections/crm_leads.definitions.js';
export { default as crmContacts } from './collections/crm_contacts.definitions.js';
export { default as crmAccounts } from './collections/crm_accounts.definitions.js';
export { default as crmOpportunities } from './collections/crm_opportunities.definitions.js';
export { default as crmTasks } from './collections/crm_tasks.definitions.js';
export { default as crmActivities } from './collections/crm_activities.definitions.js';
export { default as crmNotes } from './collections/crm_notes.definitions.js';
export { default as crmDocuments } from './collections/crm_documents.definitions.js';
export { default as crmMessages } from './collections/crm_messages.definitions.js';
export { default as crmAttachments } from './collections/crm_attachments.definitions.js';
export { default as crmSavedViews } from './collections/crm_saved_views.definitions.js';
export { default as crmAutomationRules } from './collections/crm_automation_rules.definitions.js';
export { default as crmAssignmentRules } from './collections/crm_assignment_rules.definitions.js';

export { CRM_PERMISSIONS, CRM_ROLE_TEMPLATES, default as permissions } from './permissions.js';
export { createCrmWorkflowService } from './services/createCrmWorkflowService.js';
export { createCrmActionDefinitions } from './crm.actions.js';
