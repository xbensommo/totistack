/** @file src/features/portal/feature.manifest.js */

import routes from './routes.js'
import { PORTAL_PERMISSIONS } from './permissions.js'

export const PORTAL_FEATURE_ID = 'portal'

export const portalFeatureManifest = {
  id: PORTAL_FEATURE_ID,
  kind: 'feature',
  version: '1.0.0',
  name: 'Portal',
  description: 'External-user self-service portal feature for student, client, and ecommerce experiences.',
  category: 'experience',
  icon: 'fa-regular fa-window-maximize',
  order: 54,
  routeBase: '/portal',
  entry: {
    routeName: 'PortalDashboard',
    view: 'PortalDashboardPage',
  },
  navigation: [
    {
      label: 'Portal',
      to: '/portal',
      icon: 'fa-regular fa-window-maximize',
      order: 54,
      permission: PORTAL_PERMISSIONS.VIEW_SELF,
    },
  ],
  permissions: Object.values(PORTAL_PERMISSIONS),
  routes,
  collections: [
    'portal_accounts',
    'portal_invites',
    'portal_memberships',
    'portal_preferences',
    'portal_activity_logs',
    'portal_tickets',
  ],
  capabilities: {
    selfService: true,
    memberships: true,
    billingReadOnly: true,
    documentVisibility: true,
    supportRequests: true,
    businessProfiles: true,
  },
  dependencies: {
    features: ['auth', 'notifications'],
    optionalApps: ['orders', 'finance', 'documents', 'client-records'],
  },
}

export default portalFeatureManifest
