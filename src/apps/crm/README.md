# CRM App Module

Production-ready CRM starter module aligned with the latest Totistack generated assembly structure.

## What this module contributes

- `app.manifest.js` for declarative module metadata
- `routes.js` for lazy route contribution
- shard-provider collection definitions for:
  - `crm_leads`
  - `crm_opportunities`
  - `crm_activities`
- `services/crmService.js` for root-store-driven CRM operations
- generic starter pages and components that are easy to extend

## Architecture notes

- The root application owns auth, RBAC, provider setup, and store bootstrapping.
- This CRM app does **not** self-register routes or stores.
- Collection actions are consumed from the generated collection registry through the root store.
- RBAC checks automatically respect the root store runtime toggle.
