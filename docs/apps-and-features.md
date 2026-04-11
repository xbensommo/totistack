---
title: Apps and features
nav_order: 6
---

# Apps and features

Totistack separates business modules into apps and features.

This is not cosmetic. It keeps projects easier to reason about.

## Apps

Apps are larger business modules with a clear product-facing purpose.

Examples:

- CRM
- CMS
- bookings
- orders
- documents
- dashboard

An app usually owns:

- pages
- routes
- business services
- module-specific UI
- app-level configuration

## Features

Features are cross-cutting building blocks used by one or more apps.

Examples:

- auth
- RBAC
- media
- notifications
- analytics
- integrations

A feature should solve one concern well and stay reusable.

## The difference in plain language

Use an app when the module represents a business area.

Use a feature when the module supports many business areas.

## Good examples

### App example

A CRM app can contain:

- leads pages
- customer pages
- pipeline views
- CRM services
- CRM routes

### Feature example

An RBAC feature can contain:

- roles
- permissions
- guards
- access policies
- permission-aware helpers

That RBAC feature can then be reused across CRM, CMS, bookings, and other apps.

## What to avoid

Do not blur everything into one category.

That usually creates:

- messy module boundaries
- duplicate logic
- poor reuse
- harder maintenance

If a module keeps being reused across unrelated apps, it is probably a feature.

If a module owns a business workflow end to end, it is probably an app.
