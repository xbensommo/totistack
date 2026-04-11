# Totistack v2

Totistack v2 is the modular scaffolding toolkit for generating business systems with installable apps, features, collections, and runtime registration.

## Source of truth honored

This scaffold is aligned to your Totistack v2 direction:

- global CLI through `npm install -g @xbensommo/totistack`
- `toti create <project-name>`
- feature-driven and preset-driven project generation
- project-level config and branding files
- Firestore support through `@xbensommo/shard-provider` whenever Firestore is used
- runtime registration for modules, routes, stores, and providers

## Notes

This package intentionally avoids redefining your app mental model. Registries and installers orchestrate existing apps and features instead of inventing new ones.

## Main areas

- `src/cli`: CLI entry, commands, prompts, services
- `src/core`: contracts, registries, resolvers, installers, generators, mutators, validators, providers
- `src/features`: installable cross-cutting features
- `src/presets`: curated preset bundles
- `src/templates`: scaffold templates
- `src/runtime`: generated-project runtime helpers
- `src/documents`: readme/onboarding/handoff document sources
"# totistack_cli" 
"# totistack_cli" 
"# totistack_cli" 
