# CRM App Module

Production-ready CRM starter module aligned with the latest Totistack generated assembly structure.

## What this module contributes

- `app.manifest.js` for declarative module metadata
- `routes.js` for lazy route contribution
- shard-provider collection definitions for:
  - `crm_leads`
  - `crm_contacts`
  - `crm_accounts`
  - `crm_opportunities`
  - `crm_tasks`
  - `crm_activities`
  - `crm_notes`
  - `crm_documents`
  - `crm_messages`
  - `crm_attachments`
  - `crm_saved_views`
  - `crm_automation_rules`
  - `crm_assignment_rules`
- `services/crmService.js` for root-store-driven CRM operations
- generic starter pages and components that are easy to extend

## Included CRM surface

- Leads
- Contacts
- Accounts / companies
- Opportunities and pipeline
- Tasks / reminders / follow-ups
- Activities and notes timeline
- Quotes / invoices / receipts with placeholder payloads ready for `@xbensommo/doc-generator`
- WhatsApp / email communication logging
- File attachment metadata
- Search / filters / saved views
- Workflow automation rules
- Team assignment and ownership rules
- Reports and customer history views

## Architecture notes

- The root application owns auth, RBAC, provider setup, and store bootstrapping.
- This CRM app does **not** self-register routes or stores.
- Collection actions are consumed from the generated collection registry through the root store.
- RBAC checks automatically respect the root store runtime toggle.
- Document generation is currently wired with realistic placeholder data so the real package can slot in later without restructuring the module.
