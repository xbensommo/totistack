/** @file src/features/cms/index.js */
import manifest from './feature.manifest.js'
import routes from './routes.js'
import collections from './collections/index.js'
import { createCmsActionDefinitions } from './cms.actions.js'

export { manifest, routes, collections, createCmsActionDefinitions }
export * from './permissions.js'
export default { manifest, routes, collections, createActionDefinitions: createCmsActionDefinitions }
