/** @file src/features/audit/index.js */

import manifest from './feature.manifest.js'
import routes from './routes.js'

export { manifest as auditFeatureManifest, routes as auditRoutes }
export * from './permissions.js'
export * from './definitions/auditLogs.definitions.js'
export * from './definitions/entityActivity.definitions.js'
export * from './services/auditClient.service.js'

export default { manifest, routes }
