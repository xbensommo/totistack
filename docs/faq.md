---
title: FAQ
nav_order: 9
---

# FAQ

## Is Totistack a framework?

It is better described as a modular scaffolding toolkit.

Its main job is to generate a stronger project foundation, not to trap you in a rigid runtime.

## Is it only for large systems?

No.

It is useful anywhere repeated business patterns exist. Smaller projects still benefit from better structure.

## Can I use only a few modules?

Yes.

The whole point is modular assembly. Use what you need.

## Does it force Firestore?

No.

But when Firestore is used, the expected direction is `@xbensommo/shard-provider`.

## Why separate apps and features?

Because mixing them makes projects harder to understand and maintain.

Apps represent business areas.
Features represent reusable cross-cutting concerns.

## Why generated registries?

Because runtime guessing creates avoidable mess.

Generated registries give you one assembly point and make the runtime easier to reason about.
