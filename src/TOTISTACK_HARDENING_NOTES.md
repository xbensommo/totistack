# Totistack hardening notes

## What was broken
- Live source depended on `src/core/action_modal`, but only the template copy existed.
- Permissions assembly expected declarative `permissions.js` contributions, while auth and notifications exported constants only.
- CRM and finance workflows were not consistently emitting notifications.
- Old shard configuration still remained across many apps/features.
- Multiple stale compatibility import paths were broken.
- The assembly generator still emitted outdated layout import paths and an `/a` admin root.

## What changed
- Added a real runtime `core/action_modal` package with plugin, executor, composables, and confirm modal.
- Added compatibility shims for stale imports so older source keeps working while the framework is cleaned up.
- Added declarative permission contributions for CRM, finance, auth, and notifications.
- Added role-to-permission derivation for auth profile creation.
- Wired auth, CRM, and finance flows into notifications.
- Replaced monthly/yearly shard declarations with `shard: { type: 'none' }`.
- Fixed generated route layout paths.
- Added focused regression tests for action modal, auth role profiles, CRM workflows, and finance notifications.

## Minimum you now specify for a new project
1. App/feature manifest.
2. Collection definitions with `shard: { type: 'none' }`.
3. `permissions.js` contribution with `module`, `permissions`, and `roleTemplates`.
4. Routes.
5. Service/workflow file only when the module owns business logic.
