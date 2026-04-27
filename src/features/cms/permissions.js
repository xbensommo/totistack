/** @file src/features/cms/permissions.js */

export const CMS_PERMISSIONS = Object.freeze({
  PAGES_VIEW: 'cms.pages.read',
  PAGES_CREATE: 'cms.pages.create',
  PAGES_UPDATE: 'cms.pages.update',
  PAGES_DELETE: 'cms.pages.delete',
  PAGES_PUBLISH: 'cms.pages.publish',
  CONTENT_TYPES_VIEW: 'cms.contentTypes.read',
  CONTENT_TYPES_MANAGE: 'cms.contentTypes.manage',
})

export function hasCmsPermission(actor, permission) {
  const roles = Array.isArray(actor?.roles) ? actor.roles : []
  const permissions = Array.isArray(actor?.permissions) ? actor.permissions : []
  return permissions.includes(permission) || roles.includes('admin') || roles.includes('sysadmin')
}

export const cmsRoleTemplates = Object.freeze({
  admin: Object.values(CMS_PERMISSIONS),
  consultant: [CMS_PERMISSIONS.PAGES_VIEW],
  receptionist: [CMS_PERMISSIONS.PAGES_VIEW],
  viewer: [CMS_PERMISSIONS.PAGES_VIEW],
})

export default {
  module: 'cms',
  permissions: Object.values(CMS_PERMISSIONS),
  roleTemplates: cmsRoleTemplates,
}
