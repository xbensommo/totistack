/** @file src/features/cms/index.js */

import manifest from './feature.manifest.js'
import routes from './routes.js'
import { createCmsService } from './services/cmsService.js'
import { createCmsActionDefinitions } from './cms.actions.js'

export { manifest, routes, createCmsService }
export * from './permissions.js'

export function createServices(context = {}) {
  return {
    cmsService: createCmsService(context),
  }
}

export default {
  manifest,
  routes,
  createServices,
  createActionDefinitions: createCmsActionDefinitions,
}
export { createCmsActionDefinitions }
