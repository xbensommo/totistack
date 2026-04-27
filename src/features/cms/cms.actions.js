/** @file src/features/cms/cms.actions.js */
import { CMS_PERMISSIONS } from './permissions.js'

const decision = (id, label, permission, entityType, overrides = {}) => ({
  id,
  label,
  decision: true,
  execution: 'server',
  callable: 'serverActionRun',
  permission,
  entityType,
  requiresReason: false,
  tone: 'primary',
  confirmTitle: `${label}?`,
  confirmMessage: 'This operation changes published content state and will be audited.',
  ...overrides,
})

export const cmsActionDefinitions = Object.freeze([
  decision('cms.page.publish', 'Publish page', CMS_PERMISSIONS.PAGES_PUBLISH, 'cmsPage'),
  decision('cms.page.unpublish', 'Unpublish page', CMS_PERMISSIONS.PAGES_PUBLISH, 'cmsPage', { requiresReason: true, tone: 'warning' }),
  decision('cms.page.archive', 'Archive page', CMS_PERMISSIONS.PAGES_ARCHIVE, 'cmsPage', { requiresReason: true, tone: 'warning' }),
  decision('cms.page.restore', 'Restore page', CMS_PERMISSIONS.PAGES_ARCHIVE, 'cmsPage'),
  decision('cms.page.delete', 'Delete page', CMS_PERMISSIONS.PAGES_DELETE, 'cmsPage', { requiresReason: true, tone: 'danger' }),
  decision('cms.entry.publish', 'Publish entry', CMS_PERMISSIONS.ENTRIES_PUBLISH, 'cmsEntry'),
  decision('cms.entry.unpublish', 'Unpublish entry', CMS_PERMISSIONS.ENTRIES_PUBLISH, 'cmsEntry', { requiresReason: true, tone: 'warning' }),
  decision('cms.redirect.create_from_slug_change', 'Create redirect', CMS_PERMISSIONS.REDIRECTS_MANAGE, 'cmsRedirect'),
])

export function createCmsActionDefinitions() {
  return cmsActionDefinitions
}

export default cmsActionDefinitions
