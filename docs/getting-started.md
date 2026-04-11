---
title: Getting started
nav_order: 2
---

# Getting started

## Install the CLI

```bash
npm install -g @xbensommo/totistack
```

## Create a new project

```bash
toti create <project-name>
```

Example:

```bash
toti create client-portal
```

## What happens next

During project creation, Totistack can prompt for the parts you want to install, such as:

- apps
- features
- presets
- collections
- branding and config
- provider choices

The goal is not just to generate files. The goal is to generate a project that is already structured for real work.

## What you should expect from a generated project

A generated Totistack project should give you:

- a clear folder structure
- installable modules
- generated registration points
- cleaner route and store wiring
- less repeated boilerplate
- a foundation that is easier to scale

## What Totistack does not try to do

Totistack does not try to hide your system behind magic.

You should still be able to:

- understand the folder structure
- extend apps and features directly
- replace or disable parts of the stack where needed
- keep control over project-level decisions

## Recommended first move after project creation

After scaffolding a new project:

1. review the generated project config
2. confirm installed apps and features
3. check generated routes and registries
4. verify provider setup
5. start extending the actual business logic

Do not start by rewriting the foundation unless something is clearly wrong. Use the generated structure and build on it.
