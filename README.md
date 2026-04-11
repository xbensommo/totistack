# Totistack v2

> Modular scaffolding for building real business systems faster.

Totistack v2 is a modular CLI toolkit for generating production-oriented projects with installable apps, features, presets, collections, and runtime registration.

It is built for developers and teams who want to scaffold serious business software without repeatedly rebuilding the same foundation.

---

## Overview

Totistack v2 helps you create structured projects with:

- installable apps
- reusable features
- collection-aware scaffolding
- project branding and configuration
- modular runtime registration
- Firestore support through `@xbensommo/shard-provider` when Firestore is used

Instead of manually wiring the same architecture every time, Totistack gives you a cleaner and faster starting point.

---

## Why Totistack v2

Most business applications repeat the same core patterns:

- authentication
- roles and permissions
- routing
- data collections
- CRUD pages
- dashboards
- project configuration
- branding
- integrations
- reusable business modules

Totistack v2 exists to reduce that repeated setup work and make generated projects easier to maintain, extend, and scale.

---

## Who it is for

### Business owners and non-technical users

Totistack helps development projects start faster and with better consistency.

It is suitable for systems such as:

- CRM platforms
- booking systems
- internal dashboards
- business operations tools
- admin systems
- client portals
- CMS platforms
- custom business applications

You do not need to understand the internal codebase structure to benefit from it. The main value is speed, consistency, and extensibility.

### Developers

Totistack v2 is for developers who want a better way to scaffold modular projects.

It is especially useful when you want:

- cleaner architecture
- reusable modules
- less repeated boilerplate
- installable apps and features
- better separation of concerns
- faster project generation
- easier long-term maintenance

---

## Installation

Install Totistack globally:

```bash
npm install -g @xbensommo/totistack
````

---

## Quick start

Create a new project:

```bash
toti create <project-name>
```

Example:

```bash
toti create my-business-app
```

During setup, Totistack can guide you through selecting:

* apps
* features
* presets
* collections
* project configuration
* branding options

---

## Core direction

Totistack v2 is aligned to this architecture direction:

* global CLI through `npm install -g @xbensommo/totistack`
* project creation with `toti create <project-name>`
* feature-driven and preset-driven project generation
* project-level config and branding files
* Firestore support through `@xbensommo/shard-provider` whenever Firestore is used
* runtime registration for modules, routes, stores, and providers

---

## Philosophy

Totistack v2 does not try to replace your mental model with unnecessary complexity.

It is designed to work with modular apps and features in a practical way:

* apps remain apps
* features remain features
* installers and registries orchestrate them
* generated projects stay structured and extensible

The goal is to support real business software, not toy scaffolds.

---

## Main capabilities

### 1. Modular project scaffolding

Generate projects with a cleaner and more maintainable structure from day one.

### 2. Installable apps and features

Projects can be assembled from reusable modules instead of being hard-coded from scratch.

### 3. Preset-driven setup

Presets allow you to scaffold common project types faster by bundling related modules together.

### 4. Collection-aware generation

Collections can be declared and used to generate consistent business-ready foundations.

### 5. Centralized project configuration

Branding, setup behavior, and project-level options can be defined in one place.

### 6. Runtime registration

Modules, routes, stores, and providers can be registered in a structured way instead of being manually stitched together everywhere.

### 7. Firestore-ready architecture

When Firestore is enabled, Totistack is designed to work with `@xbensommo/shard-provider` rather than reinventing the data layer.

---

## Typical use cases

Totistack v2 is a good fit for building:

* CRM systems
* ERP-style internal tools
* booking platforms
* client record systems
* admin dashboards
* content management systems
* multi-module business portals
* custom operational software

---

## Project structure

The main areas of the codebase are:

```text
src/
├── cli/         # CLI entry, commands, prompts, setup services
├── core/        # Contracts, registries, resolvers, installers, generators, validators, providers
├── features/    # Installable cross-cutting features
├── presets/     # Curated preset bundles
├── templates/   # Scaffold templates for generated projects
├── runtime/     # Runtime helpers for generated projects
└── documents/   # README, onboarding, and handoff document sources
```

---

## Codebase areas explained

### `src/cli`

Contains the command-line interface, user prompts, and setup workflows.

### `src/core`

Contains the main internal engine of Totistack, including:

* contracts
* registries
* resolvers
* installers
* generators
* mutators
* validators
* providers

### `src/features`

Contains cross-cutting installable features that can be reused across projects.

Examples include:

* auth
* RBAC
* media
* analytics
* workflows

### `src/presets`

Contains curated bundles for common project setups.

Presets help reduce setup time by grouping related apps and features together.

### `src/templates`

Contains templates used by the scaffold generator when creating projects.

### `src/runtime`

Contains helpers used by generated projects at runtime.

### `src/documents`

Contains documentation source files such as:

* README files
* onboarding guides
* developer handoff docs
* client handoff docs

---

## Firestore support

When Firestore is part of the selected project stack, Totistack v2 is designed to work with:

```bash
@xbensommo/shard-provider
```

This keeps Firestore support aligned with the overall Totistack architecture and avoids unnecessary duplication of data-layer concerns.

---

## Design goals

Totistack v2 aims to produce projects that are:

* modular
* maintainable
* scalable
* easier to extend
* faster to scaffold
* better suited for real business use

---

## Intended outcome

A Totistack-generated project should help developers move faster without sacrificing structure.

That means:

* less repeated setup work
* clearer module boundaries
* stronger project consistency
* easier extension later
* better foundations for production systems

---

## Package

Package name:

```text
@xbensommo/totistack
```

CLI command:

```bash
toti
```

---

## Example workflow

Install the CLI:

```bash
npm install -g @xbensommo/totistack
```

Create a project:

```bash
toti create client-portal
```

Choose the modules you need, configure the project, and start building on a structured foundation instead of from scratch.

---

## Status

Totistack v2 is focused on modular business-system scaffolding with support for:

* installable apps
* reusable features
* presets
* collection-aware generation
* runtime registration
* project-level configuration

The direction is practical, modular, and production-oriented.

---

## Summary

Totistack v2 is a modular scaffolding toolkit for building business software faster.

It gives developers a structured way to generate projects with installable apps, features, presets, collections, and runtime registration, while staying flexible enough for real-world business systems.

````

Also remove these completely from your file:

```md
"# totistack_cli" 
"# totistack_cli" 
"# totistack_cli"
````