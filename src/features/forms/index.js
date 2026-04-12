/**
 * @file forms/index.js
 * @description Entry exports for the Totistack forms feature.
 */
import manifest from './feature.manifest.js'
import routes from './routes.js'
import { createFormsService } from './services/formsService.js'

export { manifest, routes, createFormsService }

export function createServices(context = {}) {
  return {
    formsService: createFormsService(context),
  }
}

export default {
  manifest,
  routes,
  createServices,
}
