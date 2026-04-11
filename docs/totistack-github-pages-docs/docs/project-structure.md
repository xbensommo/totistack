---
title: Project structure
nav_order: 5
---

# Project structure

A typical Totistack project is expected to stay modular and readable.

## High-level structure

```text
src/
├── apps/
├── features/
├── generated/
├── router/
├── stores/
├── services/
├── providers/
├── config/
└── main.js
```

## Folder roles

### `src/apps/`

Contains installable app modules.

Examples:

- CRM
- CMS
- booking
- orders
- dashboard

Apps usually carry business-facing pages, module-specific routes, services, and configuration.

### `src/features/`

Contains cross-cutting features shared across apps.

Examples:

- auth
- RBAC
- media
- analytics
- workflow automation
- integrations

Features should stay reusable and not be tightly tied to one app unless there is a strong reason.

### `src/generated/`

This is the assembly point.

Generated files should contain the resolved runtime wiring for:

- routes
- stores
- services
- providers
- navigation
- permissions

This folder exists so the rest of the runtime does not have to guess what is installed.

### `src/config/`

Contains project-level configuration.

This is where branding, environment-specific settings, and setup decisions should live.

## What a healthy Totistack project looks like

A healthy project should be easy to read at a glance.

You should be able to answer these questions fast:

- what apps are installed
- what features are installed
- where the generated runtime wiring is
- where project config lives
- where business logic belongs

If the structure cannot answer those questions clearly, it needs cleanup.
