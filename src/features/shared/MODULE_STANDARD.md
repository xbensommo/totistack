# Totistack Apps/Features Standard

This is the rule for production modules:

```txt
Apps and features declare.
The generated framework assembles.
The root store executes.
Services contain business logic only.
Decision actions go through action-modal definitions.
```

## Root-store usage

Correct:

```js
await store.clientsActions.fetchInitialPage({
  filters: [{ field: 'status', op: '==', value: 'active' }],
  limit: 50,
})

await store.clientsActions.add(payload)
await store.clientsActions.update(id, patch)
await store.clientsActions.remove(id)
```

Wrong:

```js
collectionsActions.clients.fetch(...)
getCollectionActions(store, 'clients')
callFirstAvailable(...)
```

## Services

Services may contain business operations:

```js
convertLeadToOpportunity()
reverseJournalEntry()
archiveClient()
```

Services must not wrap basic shard-provider actions for no reason.

## Action modal

Every destructive or decision-based operation must have an action definition:

```txt
update
delete/remove/archive
reverse
transfer
refund
cancel
publish
post
close
assign
complete
```

The action definition is the UI decision boundary. The service is the executor.

## Deleted patterns

Removed from production module folders:

```txt
*-ui-beautified/
apps/portal/
apps/modules/
apps/core/
features/core/
crm.service.js
collectionsActions
callFirstAvailable
```

## Contract test

Run:

```bash
node src/features/shared/tests/apps-features-contract.test.mjs
```
