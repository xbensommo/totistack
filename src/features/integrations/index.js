/**
 * @file integrations/index.js
 * @description Entry exports for the Totistack integrations feature.
 */
import manifest from './feature.manifest.js'
import routes from './routes.js'
import { createIntegrationsService } from './services/integrationService.js'
import { createIntegrationsActionDefinitions } from './integrations.actions.js'

export { manifest, routes, createIntegrationsService }

export function createServices(context = {}) {
  return {
    integrationsService: createIntegrationsService(context),
  }
}

export default {
  manifest,
  routes,
  createServices,
  createActionDefinitions: createIntegrationsActionDefinitions,
}
export { createIntegrationsActionDefinitions }
