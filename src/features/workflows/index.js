/**
 * @file workflows/index.js
 * @description Entry exports for the Totistack workflows feature.
 */
import manifest from './feature.manifest.js'
import routes from './routes.js'
import { createWorkflowService } from './services/workflowService.js'

export { manifest, routes, createWorkflowService }

export function createServices(context = {}) {
  return {
    workflowService: createWorkflowService(context),
  }
}

export default {
  manifest,
  routes,
  createServices,
}
