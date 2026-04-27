# Totistack Server Actions + Notifications + Audit v1

Production first version for Totistack projects.

This package gives you three separate framework features:

- `server-actions`: developer-declared trusted operations only.
- `notifications`: Firestore inbox + FCM token registration + delivery tracking.
- `audit`: immutable-ish action/entity logs for sensitive operations.

It also includes a standalone Firebase Functions backend spine under `functions/`.

## Design rule

Normal CRUD stays cheap:

```js
store.productsActions.fetchInitialPage()
store.productsActions.add(payload)
store.productsActions.update(id, patch)
```

Declared protected operations use server actions:

```js
await serverActions.run({
  actionId: 'finance.payment.reverse',
  entityType: 'financePayment',
  entityId: paymentId,
  reason,
  input: { paymentId },
})
```

Notifications are created only for meaningful declared events. Audit is mandatory for sensitive server actions.

## Package layout

```txt
src/features/server-actions/
src/features/notifications/
src/features/audit/
functions/
firestore.rules.snippet
public/firebase-messaging-sw.example.js
```

## Install manually

1. Copy the three feature folders into your framework project:

```bash
cp -R src/features/server-actions <your-project>/src/features/server-actions
cp -R src/features/notifications <your-project>/src/features/notifications
cp -R src/features/audit <your-project>/src/features/audit
```

If your project already has old `notifications` or `audit` folders, back them up first and replace them deliberately. Do not merge old and new files blindly.

2. Copy the `functions` folder to your project root:

```bash
cp -R functions <your-project>/functions
```

If your project already has a `functions` folder, merge the `src/` structure and keep your existing Firebase project files.

3. Install function dependencies:

```bash
cd <your-project>/functions
npm install
```

4. Add the feature manifests/collections to your Totistack assembly process the same way your other features are registered. Do not touch your root store manually unless your framework build currently requires manual feature imports.

5. Add the Firestore rules snippet from `firestore.rules.snippet` into your real Firestore rules and adjust role/claim checks to your auth model.

6. Add your web push VAPID key to the frontend environment:

```env
VITE_FIREBASE_MESSAGING_VAPID_KEY=your_web_push_certificate_key
```

7. Copy `public/firebase-messaging-sw.example.js` to your app public folder as `firebase-messaging-sw.js`, then fill in the Firebase web config.

8. Deploy functions:

```bash
firebase deploy --only functions
```

## First server action

Add a handler in:

```txt
functions/src/generated/server-actions.registry.js
```

Example shape:

```js
export const serverActionRegistry = Object.freeze({
  'finance.payment.reverse': {
    id: 'finance.payment.reverse',
    label: 'Reverse payment',
    permission: 'finance.payments.reverse',
    entityType: 'financePayment',
    collection: 'financePayments',
    requiresReason: true,
    idempotency: true,
    audit: true,
    input: {
      required: ['paymentId'],
    },
    async handler(ctx) {
      const { paymentId } = ctx.input
      // perform transaction here
      await ctx.notify({
        recipientUserId: ctx.auth.uid,
        type: 'finance.payment.reversed',
        title: 'Payment reversed',
        message: 'The payment was reversed successfully.',
        entityType: 'financePayment',
        entityId: paymentId,
        actionUrl: `/finance/payments/${paymentId}`,
        priority: 'high',
      })
      return { paymentId }
    },
  },
})
```

That registry is intentionally explicit. Later your Totistack CLI can generate it from app/feature declarations.

## Function exports

The backend exports:

- `serverActionRun`
- `notificationRegisterToken`
- `notificationRevokeToken`
- `notificationsOnCreate`
- `notificationRetryFailedDeliveries`
- `notificationCleanupTokens`

## Cost rule

Use server actions only when the module declares them. Do not route ordinary CRUD through Cloud Functions.

Use server actions when an operation needs:

- Admin SDK privileges
- multiple document transaction
- external provider/API
- hidden secrets
- permission enforcement beyond Firestore rules
- audit trail
- idempotency
- money/security/legal consequence

## Firebase baseline

This package uses Cloud Functions v2 and Node.js 22. Firebase currently supports Node.js 20 and 22 for Cloud Functions, and Node.js 18 is deprecated.
