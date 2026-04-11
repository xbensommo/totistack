---
title: Architecture
nav_order: 4
---

# Architecture

Totistack v2 is built around modular assembly.

The rule is simple: keep apps and features declarative, then assemble them into generated runtime files.

## Core direction

Totistack follows this structure:

- `src/apps/` for installable apps
- `src/features/` for installable cross-cutting features
- `src/generated/` as the assembly point
- generated runtime registries as the source of truth during runtime

## Why this matters

This avoids two common problems:

1. runtime discovery chaos
2. hand-wired duplication spread across the codebase

Instead of letting every module wire itself however it wants, Totistack pushes assembly into generated files.

That keeps the runtime cleaner.

## Build-time assembly

Apps and features are authored in their own folders.

The CLI reads them, resolves what is installed, and writes generated files for things like:

- routes
- stores
- services
- providers
- navigation
- permissions
- workflows

## Runtime rule

Runtime code should import generated registries, not scan folders dynamically.

That means:

- no runtime module discovery
- no scattered module wiring
- fewer surprises
- easier debugging

## Store strategy

Totistack prefers multiple domain stores over one massive global store.

That keeps ownership clear and reduces long-term maintenance pain.

## Design principles

The architecture leans on a few non-negotiables:

- separation of concerns
- modularity
- predictable assembly
- production-ready extension paths
- less repeated boilerplate
- no unnecessary reinvention

## What this architecture is trying to prevent

Without clear assembly rules, projects usually drift into:

- duplicated route wiring
- scattered store registration
- hard-coded module coupling
- giant unreadable setup files
- difficult onboarding for other developers

Totistack is built to stop that drift early.
