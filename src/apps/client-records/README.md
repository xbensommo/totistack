# Client Records App

Production-ready starter app for Totistack's latest generated-assembly architecture.

## What this version changes

- keeps the app declarative
- contributes routes, collections, and services only
- removes direct Firestore coupling from the app service layer
- assumes one root shard-provider and one root app store
- upgrades the Vue UI into reusable starter-grade components

## Structure

```txt
client-records/
  app.manifest.js
  routes.js
  services.js
  services/
    clientService.js
  collections/
    clients.definitions.js
    clientContacts.definitions.js
    clientActivities.definitions.js
    clientNotes.definitions.js
  components/
    ActivityTimeline.vue
    ClientSummaryPanel.vue
    EmptyState.vue
    EntityPageShell.vue
    EntitySectionCard.vue
    EntityStatsGrid.vue
    EntityTable.vue
  pages/
    ClientCreatePage.vue
    ClientDetailPage.vue
    ClientEditPage.vue
    ClientsListPage.vue
```

## Runtime expectations

This app expects Totistack root infrastructure to provide:

- generated collection actions such as `clientsActions`
- collection state slices such as `clients.items`
- root auth state on the default app store
- optional RBAC checks at router and service level

## Design notes

The Vue components are intentionally generic first:

- `EntityPageShell.vue` for app pages
- `EntitySectionCard.vue` for sections
- `EntityTable.vue` for CRUD listings
- `EntityStatsGrid.vue` for stat summaries
- `ActivityTimeline.vue` for event history
- `EmptyState.vue` for blank states

They are suitable as starter components for CRM, orders, bookings, projects, support, and other back-office apps.
