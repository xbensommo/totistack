/** @file src/features/portal/index.js */

export * from './feature.manifest.js'
export * from './routes.js'
export * from './permissions.js'
export * from './business/default-profile.js'

export { default as portalAccountsDefinition } from './definitions/portal_accounts.definitions.js'
export { default as portalInvitesDefinition } from './definitions/portal_invites.definitions.js'
export { default as portalMembershipsDefinition } from './definitions/portal_memberships.definitions.js'
export { default as portalPreferencesDefinition } from './definitions/portal_preferences.definitions.js'
export { default as portalActivityLogsDefinition } from './definitions/portal_activity_logs.definitions.js'
export { default as portalTicketsDefinition } from './definitions/portal_tickets.definitions.js'

export * from './services.js'
export * from './stores/usePortalStore.js'
export * from './composables/usePortal.js'

export { default as PortalPageShell } from './components/PortalPageShell.vue'
export { default as PortalSummaryCard } from './components/PortalSummaryCard.vue'
export { default as PortalActionCard } from './components/PortalActionCard.vue'
export { default as PortalEmptyState } from './components/PortalEmptyState.vue'

export { default as PortalDashboardPage } from './pages/PortalDashboardPage.vue'
export { default as PortalWorkspacePage } from './pages/PortalWorkspacePage.vue'
export { default as PortalDocumentsPage } from './pages/PortalDocumentsPage.vue'
export { default as PortalBillingPage } from './pages/PortalBillingPage.vue'
export { default as PortalSupportPage } from './pages/PortalSupportPage.vue'
export { default as PortalSettingsPage } from './pages/PortalSettingsPage.vue'
export { default as PortalMembershipsPage } from './pages/PortalMembershipsPage.vue'
