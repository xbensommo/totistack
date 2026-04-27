/** @file src/apps/ecommerce/index.js */
import manifest from './app.manifest.js'
import routes from './routes.js'
import collections from './collections/index.js'
import { createEcommerceActionDefinitions } from './ecommerce.actions.js'

export { manifest, routes, collections, createEcommerceActionDefinitions }
export * from './permissions.js'
export default { manifest, routes, collections, createActionDefinitions: createEcommerceActionDefinitions }
