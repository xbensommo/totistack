/** @file src/features/cms/routes.js */
import { CMS_PERMISSIONS } from './permissions.js'

const view = (path, name, title, component, permission) => ({
  path,
  name,
  component,
  meta: { requiresAuth: true, feature: 'cms', title, permission },
})

export default [
  view('/admin/cms', 'CmsDashboard', 'CMS', () => import('./pages/CmsDashboardPage.vue'), CMS_PERMISSIONS.DASHBOARD_VIEW),
  view('/admin/cms/pages', 'CmsPages', 'Pages', () => import('./pages/CmsPagesPage.vue'), CMS_PERMISSIONS.PAGES_READ),
  view('/admin/cms/pages/:id', 'CmsPageEditor', 'Page editor', () => import('./pages/CmsPageEditorPage.vue'), CMS_PERMISSIONS.PAGES_UPDATE),
  view('/admin/cms/entries', 'CmsEntries', 'Entries', () => import('./pages/CmsEntriesPage.vue'), CMS_PERMISSIONS.ENTRIES_READ),
  view('/admin/cms/content-types', 'CmsContentTypes', 'Content types', () => import('./pages/CmsContentTypesPage.vue'), CMS_PERMISSIONS.CONTENT_TYPES_MANAGE),
  view('/admin/cms/menus', 'CmsMenus', 'Menus', () => import('./pages/CmsMenusPage.vue'), CMS_PERMISSIONS.MENUS_MANAGE),
  view('/admin/cms/redirects', 'CmsRedirects', 'Redirects', () => import('./pages/CmsRedirectsPage.vue'), CMS_PERMISSIONS.REDIRECTS_MANAGE),
]
