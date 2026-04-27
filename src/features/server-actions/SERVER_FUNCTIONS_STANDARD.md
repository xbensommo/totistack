# Totistack server functions standard

Do not edit `functions/src/generated/*` manually.

Apps/features that need backend execution declare backend files inside their own module:

```txt
src/apps/<app-id>/functions/server-actions.js
src/apps/<app-id>/functions/notifications.js
src/apps/<app-id>/functions/firestore-triggers.js

src/features/<feature-id>/functions/server-actions.js
src/features/<feature-id>/functions/notifications.js
src/features/<feature-id>/functions/firestore-triggers.js
```

## Server action declaration

Use server actions only for developer-declared protected operations: money, roles, cross-document transactions, external APIs, irreversible actions, or operations requiring hidden secrets.

```js
export const serverActions = [
  {
    id: 'finance.payment.reverse',
    label: 'Reverse payment',
    permission: 'finance.payments.reverse',
    entityType: 'financePayment',
    requiresReason: true,
    input: { required: ['paymentId'] },
    async handler(ctx) {
      // Use ctx.db, ctx.FieldValue, ctx.audit(), ctx.notify()
      return { paymentId: ctx.input.paymentId }
    },
  },
]
```

## Notification declaration

Notifications are declared only for meaningful events. Do not notify on every tiny update.

```js
export const notificationDefinitions = [
  {
    type: 'finance.payment.reversed',
    title: 'Payment reversed',
    message: 'A payment was reversed.',
    entityType: 'financePayment',
    priority: 'high',
    delivery: { push: true },
  },
]
```

## Firestore trigger declaration

Use triggers for automated events, not user decisions.

```js
export const firestoreTriggers = [
  {
    name: 'crmLeadCreatedNotification',
    event: 'created',
    document: 'crm_leads/{leadId}',
    async handler(event) {
      // Automated notification logic only.
    },
  },
]
```

## Generation

When `server-actions`, `notifications`, or `audit` is selected, Totistack generates:

```txt
functions/src/generated/server-actions.registry.js
functions/src/generated/notifications.registry.js
functions/src/generated/functions.generated.js
```

The generated files are deployment artifacts. Source declarations remain inside the app/feature that owns the business rule.
