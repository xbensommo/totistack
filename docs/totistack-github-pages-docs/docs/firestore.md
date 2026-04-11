---
title: Firestore integration
nav_order: 7
---

# Firestore integration

When a Totistack project uses Firestore, the expected data layer is `@xbensommo/shard-provider`.

That is the default direction whenever Firestore is enabled.

## Why this matters

Firestore projects usually go wrong in familiar ways:

- repeated query boilerplate
- weak pagination patterns
- poor relationship handling
- inconsistent CRUD flows
- avoidable overfetching
- painful scaling later

Using a consistent provider solves that earlier.

## What the provider is there to handle

Depending on project setup, the provider can help with areas such as:

- sharding
- pagination
- includes and relationship hydration
- collection actions
- soft delete or archive flows
- collection-aware data access

## Totistack position

Totistack should not reinvent the Firestore data layer if a dedicated provider already exists and fits the architecture.

That is why Firestore-based projects should align with `@xbensommo/shard-provider` unless there is a strong reason not to.

## What this means for module authors

If your app or feature depends on Firestore:

- do not scatter raw Firestore logic everywhere
- keep data access patterns consistent
- rely on the project provider contract
- build business logic on top of the data layer, not inside random components
