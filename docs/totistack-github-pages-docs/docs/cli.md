---
title: CLI reference
nav_order: 3
---

# CLI reference

## Main command

```bash
toti create <project-name>
```

Creates a new Totistack project.

Example:

```bash
toti create crm-platform
```

## Global install

```bash
npm install -g @xbensommo/totistack
```

## CLI direction

The CLI is responsible for project scaffolding, not runtime hacks.

Its job is to:

- create projects
- install selected apps and features
- apply presets
- generate registries and runtime assembly points
- write project-level config files
- prepare the foundation for further development

## Expected command style

Totistack is built around a direct CLI workflow.

Examples:

```bash
toti create my-app
```

Future commands may include areas such as:

```bash
toti apps
toti features
toti presets
toti add <module>
```

The exact command set depends on the current package version, but the design direction stays the same: keep the CLI focused, useful, and predictable.

## CLI principles

The CLI should:

- reduce setup time
- avoid noisy scaffolds
- generate practical structure
- respect modular boundaries
- keep project assembly clean

If a command does not make project setup clearer or faster, it should not exist.
