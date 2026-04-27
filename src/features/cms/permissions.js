/** @file src/features/cms/permissions.js */
export const CMS_ROLES = Object.freeze({
  ADMIN: 'cms.admin',
  EDITOR: 'cms.editor',
  PUBLISHER: 'cms.publisher',
  VIEWER: 'cms.viewer',
})

export const CMS_PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'cms.dashboard.view',
  PAGES_READ: 'cms.pages.read',
  PAGES_CREATE: 'cms.pages.create',
  PAGES_UPDATE: 'cms.pages.update',
  PAGES_PUBLISH: 'cms.pages.publish',
  PAGES_ARCHIVE: 'cms.pages.archive',
  PAGES_DELETE: 'cms.pages.delete',
  ENTRIES_READ: 'cms.entries.read',
  ENTRIES_CREATE: 'cms.entries.create',
  ENTRIES_UPDATE: 'cms.entries.update',
  ENTRIES_PUBLISH: 'cms.entries.publish',
  ENTRIES_ARCHIVE: 'cms.entries.archive',
  CONTENT_TYPES_MANAGE: 'cms.content_types.manage',
  MENUS_MANAGE: 'cms.menus.manage',
  REDIRECTS_MANAGE: 'cms.redirects.manage',
})

export const cmsPermissions = Object.freeze(Object.values(CMS_PERMISSIONS))

export const cmsRolePermissions = Object.freeze({
  [CMS_ROLES.ADMIN]: cmsPermissions,
  [CMS_ROLES.EDITOR]: [
    CMS_PERMISSIONS.DASHBOARD_VIEW,
    CMS_PERMISSIONS.PAGES_READ,
    CMS_PERMISSIONS.PAGES_CREATE,
    CMS_PERMISSIONS.PAGES_UPDATE,
    CMS_PERMISSIONS.ENTRIES_READ,
    CMS_PERMISSIONS.ENTRIES_CREATE,
    CMS_PERMISSIONS.ENTRIES_UPDATE,
    CMS_PERMISSIONS.MENUS_MANAGE,
  ],
  [CMS_ROLES.PUBLISHER]: [
    CMS_PERMISSIONS.DASHBOARD_VIEW,
    CMS_PERMISSIONS.PAGES_READ,
    CMS_PERMISSIONS.PAGES_UPDATE,
    CMS_PERMISSIONS.PAGES_PUBLISH,
    CMS_PERMISSIONS.PAGES_ARCHIVE,
    CMS_PERMISSIONS.ENTRIES_READ,
    CMS_PERMISSIONS.ENTRIES_UPDATE,
    CMS_PERMISSIONS.ENTRIES_PUBLISH,
    CMS_PERMISSIONS.ENTRIES_ARCHIVE,
    CMS_PERMISSIONS.REDIRECTS_MANAGE,
  ],
  [CMS_ROLES.VIEWER]: [
    CMS_PERMISSIONS.DASHBOARD_VIEW,
    CMS_PERMISSIONS.PAGES_READ,
    CMS_PERMISSIONS.ENTRIES_READ,
  ],
})
