/**
 * @file index.js
 * @description Client Records app public entrypoint.
 */

import manifest from './app.manifest.js'
import createRoutes from './routes.js'
import createServices from './services.js'

export { manifest, createRoutes, createServices }

export default {
  manifest,
  createRoutes,
  createServices,
}
