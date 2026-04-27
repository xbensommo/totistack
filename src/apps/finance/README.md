# Totistack Finance App

This finance app is now wired for a **single real runtime path**:

- repositories must come from the **root store collection action registry**
- page actions must go through the **finance command bus**
- posted ledger entries are the **source of truth** for reports
- closed periods now **block posting and reversal**
- demo mode is **explicit only**

## What changed

- fixed broken app bootstrap exports
- removed the silent fake-runtime assumption from the Pinia store
- added explicit runtime configuration via `configureFinanceRuntime(...)`
- upgraded transaction schema with real-world business links
- enforced period lock checks in the command bus
- blocked duplicate posting and duplicate reversal
- kept reversal instead of delete for audit trail integrity

## Required app boot integration

Configure the finance runtime during host app boot:

```js
import { configureFinanceRuntime } from '@/apps/finance'
import { useAppStore } from '@/app/stores/appStore'

const store = useAppStore()

configureFinanceRuntime({
  store,
  getCurrentUser: () => store.currentUser,
  confirm: async ({ title, message }) => window.confirm(`${title}\n\n${message}`),
})
```

## Optional isolated preview mode

Only use this for previews or story/demo environments:

```js
import { configureFinanceRuntime } from '@/apps/finance'

configureFinanceRuntime({
  allowDemoMode: true,
})
```

## Brutal truth

This package is **not self-sufficient** unless the host app gives it:

- a root store with generated collection actions and collection state
- a current user resolver
- a confirm handler or modal bridge

Without that runtime, the store now fails loudly instead of pretending everything is fine.
