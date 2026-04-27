/** @file src/features/cms/routes.js */

import { CMS_PERMISSIONS } from './permissions.js'

export default [
  {
    path: '/admin/cms/pages',
    name: 'CmsPages',
    component: () => import('./pages/CmsPagesPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'cms',
      permission: CMS_PERMISSIONS.PAGES_VIEW,
      title: 'Pages',
    },
  },
  {
    path: '/admin/cms/content-types',
    name: 'CmsContentTypes',
    component: () => import('./pages/CmsContentTypesPage.vue'),
    meta: {
      requiresAuth: true,
      feature: 'cms',
      permission: CMS_PERMISSIONS.CONTENT_TYPES_VIEW,
      title: 'Content Types',
    },
  },
]
