---
title: Module authoring
nav_order: 8
---

# Module authoring

Totistack modules should be written to be installed, understood, and extended without drama.

## General rule

Keep modules declarative.

A module should clearly describe what it contributes instead of hiding wiring inside side effects.

## Authoring an app

An app should focus on one business area.

A typical app may include:

- `manifest.js`
- `routes.js`
- `stores/`
- `services/`
- `pages/`
- `components/`

An app should not behave like a dumping ground for unrelated cross-cutting logic.

## Authoring a feature

A feature should focus on one reusable concern.

A typical feature may include:

- `manifest.js`
- `routes.js`
- `stores/`
- `services/`
- `guards/`
- `adapters/`
- `components/`

## Expectations for both

Whether you are writing an app or a feature, keep these standards:

- clear naming
- predictable exports
- low coupling
- strong boundaries
- minimal hidden behavior
- production-ready error handling
- useful internal documentation

## Bad authoring patterns

Avoid these:

- runtime self-registration everywhere
- hidden route injection
- giant index files doing too much
- business logic inside UI components
- duplicated provider logic
- vague folder names

## Good authoring mindset

Ask these questions before shipping a module:

- can another developer understand it fast
- can it be installed cleanly
- can it be removed cleanly
- does it respect the project contracts
- does it add real value or just more files

If the answer is no, fix it before it lands.
