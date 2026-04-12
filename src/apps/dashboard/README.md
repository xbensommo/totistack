# Dashboard App

Production-ready starter dashboard app aligned with the latest Totistack generated assembly structure.

## What changed

- removed the old self-initializing runtime pattern
- removed runtime route registration and module store registration
- moved the app to a declarative shape with `app.manifest.js`, `routes.js`, and `services/`
- replaced the old Vuex-only dashboard store design with a service that reads from the root app store
- kept the dashboard generic so it can be reused across many Totistack projects
- added starter pages and widgets that are easy to extend without rewriting the core framework

## Structure

- `app.manifest.js` - dashboard metadata and navigation
- `routes.js` - route contribution for generated assembly
- `services/dashboardService.js` - generic dashboard data service
- `components/` - reusable starter dashboard UI blocks
- `pages/` - main dashboard, analytics, and reports starter pages

## Design notes

- auth and rbac belong to the root application store
- dashboard reads from generated collection actions through the root store
- this app intentionally avoids creating its own provider or mutating the router at runtime
- widgets are lightweight on purpose so projects can replace them easily later
