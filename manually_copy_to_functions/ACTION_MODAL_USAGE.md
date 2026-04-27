# Action modal usage

Use the action modal only for decision actions. Do not wrap every normal CRUD field edit.

## Client action

Use direct shard-provider action:

```js
await store.productsActions.update(productId, patch)
```

Use this when:

- single collection write
- Firestore rules can protect it
- no money/security/legal impact
- no external API
- no hidden secret
- no cross-collection invariant

## Server action

Use server action client from the modal confirmation result:

```js
const serverActions = createServerActionClient({ functions })

await serverActions.run({
  actionId: 'finance.payment.reverse',
  entityType: 'financePayment',
  entityId: paymentId,
  reason: confirmation.reason,
  input: { paymentId },
})
```

Use this when:

- delete/archive/restore is sensitive
- approve/reject/cancel/publish/post/finalize
- reverse/transfer/refund/payout
- role or permission changes
- multiple documents must change together
- an external API is used
- audit is mandatory
- idempotency is required

## Automated notification

Use Cloud Function trigger only for declared meaningful events:

- lead assigned
- payment proof uploaded
- document approved
- booking confirmed/cancelled
- consultant invited

Do not notify on every typo edit, draft save, table filter, or mark-read operation.
