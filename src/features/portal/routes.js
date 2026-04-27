/** @file src/features/portal/routes.js */

import { PORTAL_PERMISSIONS } from './permissions.js'

const routes = [
  {
    path: '/portal',
    name: 'PortalDashboard',
    component: () => import('./pages/PortalDashboardPage.vue'),
    meta: {
      title: 'Portal',
      requiresAuth: true,
      layout: 'app',
      featureId: 'portal',
      navLabel: 'Portal',
      icon: 'fa-regular fa-window-maximize',
      order: 54,
      permission: PORTAL_PERMISSIONS.VIEW_SELF,
    },
  },
  {
    path: '/portal/workspace',
    name: 'PortalWorkspace',
    component: () => import('./pages/PortalWorkspacePage.vue'),
    meta: {
      title: 'Portal Workspace',
      requiresAuth: true,
      layout: 'app',
      featureId: 'portal',
      permission: PORTAL_PERMISSIONS.VIEW_SELF,
    },
  },
  {
    path: '/portal/documents',
    name: 'PortalDocuments',
    component: () => import('./pages/PortalDocumentsPage.vue'),
    meta: {
      title: 'Portal Documents',
      requiresAuth: true,
      layout: 'app',
      featureId: 'portal',
      permission: PORTAL_PERMISSIONS.DOCUMENTS_VIEW,
    },
  },
  {
    path: '/portal/billing',
    name: 'PortalBilling',
    component: () => import('./pages/PortalBillingPage.vue'),
    meta: {
      title: 'Portal Billing',
      requiresAuth: true,
      layout: 'app',
      featureId: 'portal',
      permission: PORTAL_PERMISSIONS.BILLING_VIEW,
    },
  },
  {
    path: '/portal/support',
    name: 'PortalSupport',
    component: () => import('./pages/PortalSupportPage.vue'),
    meta: {
      title: 'Portal Support',
      requiresAuth: true,
      layout: 'app',
      featureId: 'portal',
      permission: PORTAL_PERMISSIONS.SUPPORT_CREATE,
    },
  },
  {
    path: '/portal/settings',
    name: 'PortalSettings',
    component: () => import('./pages/PortalSettingsPage.vue'),
    meta: {
      title: 'Portal Settings',
      requiresAuth: true,
      layout: 'app',
      featureId: 'portal',
      permission: PORTAL_PERMISSIONS.MANAGE_SELF,
    },
  },
  {
    path: '/portal/admin/memberships',
    name: 'PortalMemberships',
    component: () => import('./pages/PortalMembershipsPage.vue'),
    meta: {
      title: 'Portal Memberships',
      requiresAuth: true,
      layout: 'app',
      featureId: 'portal',
      permission: PORTAL_PERMISSIONS.MEMBERSHIPS_VIEW,
    },
  },
]

export default routes
