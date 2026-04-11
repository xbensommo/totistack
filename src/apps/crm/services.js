/**
 * @file crm/services.js
 * @description CRM service registry entry for Totistack generated assembly.
 */

import { createCrmService } from './services/crm.service.js'

/**
 * Create CRM services from shared root infrastructure.
 *
 * @param {object} context
 * @param {object} context.provider
 * @param {object} [context.access]
 * @param {object} [context.logger]
 * @returns {{ crm: ReturnType<typeof createCrmService> }}
 */
export function createServices(context) {
  return {
    crm: createCrmService(context),
  }
}

export default createServices
