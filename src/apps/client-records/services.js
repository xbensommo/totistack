/**
 * @file services.js
 * @description Client Records service registry entrypoint.
 */

import { createClientService } from './services/clientService.js'

/**
 * Create app services.
 *
 * @param {object} context
 * @returns {{ clientRecords: ReturnType<typeof createClientService> }}
 */
export default function createServices(context = {}) {
  return {
    clientRecords: createClientService(context),
  }
}
