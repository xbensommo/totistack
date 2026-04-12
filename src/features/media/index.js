/**
 * @file media/index.js
 * @description Entry exports for the Totistack media feature.
 */
import manifest from './feature.manifest.js'
import routes from './routes.js'
import { createMediaService } from './services/mediaService.js'

export { manifest, routes, createMediaService }

export function createServices(context = {}) {
  return {
    mediaService: createMediaService(context),
  }
}

export default {
  manifest,
  routes,
  createServices,
}
