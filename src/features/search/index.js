/**
 * @file search/index.js
 * @description Entry exports for the Totistack search feature.
 */
import manifest from './feature.manifest.js'
import routes from './routes.js'
import { createSearchService } from './services/searchService.js'

export { manifest, routes, createSearchService }

export function createServices(context = {}) {
  return {
    searchService: createSearchService(context),
  }
}

export default {
  manifest,
  routes,
  createServices,
}
