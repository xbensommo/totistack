/** @file src/features/cms/feature.manifest.js */

import routes from './routes.js'
import { CMS_PERMISSIONS } from './permissions.js'

export default {
  id: 'cms',
  type: 'feature',
  name: 'Content Management System',
  version: '3.0.0',
  description: 'Root-store-first CMS core for pages and content type definitions.',
  dependencies: {
    features: ['auth', 'rbac'],
    apps: [],
  },
  collections: ['contentTypes', 'pages'],
  services: ['cmsService'],
  routes,
  permissions: Object.values(CMS_PERMISSIONS),
}
