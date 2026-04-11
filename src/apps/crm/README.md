# CRM App

This CRM package was updated to match the latest Totistack assembly model.

## What changed

- Declarative `manifest.js`, `routes.js`, and `services.js`
- Collection definitions migrated to shard-provider `defineCollection(...)`
- Old runtime `initialize()` pattern removed from the main integration path
- Backward-compatible file re-exports kept for older references
- Generic starter pages added so routes resolve cleanly

## Integration model

This app now contributes only:

- routes
- services
- collections

The Totistack root app owns provider creation, generated assembly, auth, RBAC, and router bootstrapping.
