# Portal Feature

Production-ready Totistack external-user portal feature.

## What it is

This feature provides a controlled self-service portal for external users such as:

- students
- clients
- ecommerce customers
- billing contacts
- guardians / parents
- account owners

It is **not** the source of truth for domain data.

The portal is a secure window into existing apps and features:

- auth
- notifications
- documents
- orders
- finance
- client records
- bookings

## What it owns directly

- portal accounts
- portal invites
- portal memberships
- portal preferences
- portal activity logs
- portal tickets

## What it reads from other modules

- orders
- invoices / transactions
- documents
- client or student records

## Design rules

- use root-store collection actions only
- no local shard actions in the feature
- external access is membership-based
- business behavior is profile-driven
- actions are auditable and deliberate
- portal reads finance, it does not replace finance

## Profiles

- `generic`
- `student`
- `client`
- `ecommerce`

Each profile changes labels, widgets, action set, and collection aliases without rewriting the core feature.

## Required host capabilities

The host root store should expose generated collection actions for these collections:

- `portal_accounts`
- `portal_invites`
- `portal_memberships`
- `portal_preferences`
- `portal_activity_logs`
- `portal_tickets`

Optional external collections improve the experience:

- `orders`
- `crm_documents`
- `transactions`
- `clients`
- `student_records`
- `bookings`

## Route summary

- `/portal`
- `/portal/workspace`
- `/portal/documents`
- `/portal/billing`
- `/portal/support`
- `/portal/settings`
- `/portal/admin/memberships`

## Practical limitation

The cross-module record lookup is intentionally conservative. For large deployments, tighten the host business profile filters and collection aliases to avoid broad client-side filtering.
