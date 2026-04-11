/**
 * @file crm/index.js
 * @description CRM module entry for declarative Totistack assembly.
 */

import manifest from './manifest.js'
import routes from './routes.js'
import createServices from './services.js'
import crmLeads from './collections/crm_leads.definitions.js'
import crmOpportunities from './collections/crm_opportunities.definitions.js'
import crmActivities from './collections/crm_activities.definitions.js'

export const collections = [crmLeads, crmOpportunities, crmActivities]

export {
  manifest,
  routes,
  createServices,
}

export default {
  manifest,
  routes,
  createServices,
  collections,
}
