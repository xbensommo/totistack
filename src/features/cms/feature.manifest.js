/** @file src/features/cms/feature.manifest.js */
import routes from './routes.js'
import cmsCollections from './collections/index.js'
import { cmsPermissions } from './permissions.js'
import { createCmsActionDefinitions } from './cms.actions.js'

export default {
  id: 'cms',
  type: 'feature',
  name: 'CMS',
  version: '2.0.0',
  description: 'Production content publishing feature with draft/published separation, immutable versions, menus, redirects, and SEO fields.',
  category: 'content',
  icon: 'file-text',
  enabledByDefault: false,
  dependencies: ['auth', 'server-actions', 'notifications', 'audit'],
  routes,
  collections: cmsCollections,
  permissions: cmsPermissions,
  createActionDefinitions: createCmsActionDefinitions,
  navigation: [
    { label: 'CMS', to: '/admin/cms', icon: 'file-text', permission: 'cms.dashboard.view' },
    { label: 'Pages', to: '/admin/cms/pages', icon: 'files', permission: 'cms.pages.read' },
    { label: 'Entries', to: '/admin/cms/entries', icon: 'database', permission: 'cms.entries.read' },
    { label: 'Content types', to: '/admin/cms/content-types', icon: 'list-tree', permission: 'cms.content_types.manage' },
    { label: 'Menus', to: '/admin/cms/menus', icon: 'menu', permission: 'cms.menus.manage' },
    { label: 'Redirects', to: '/admin/cms/redirects', icon: 'route', permission: 'cms.redirects.manage' },
  ],
}
