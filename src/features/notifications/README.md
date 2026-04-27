# Totistack Notifications v2.2.13 UX Recovery

This patch restores the stronger older notification UX while keeping the newer durable Firestore/FCM transport layer.

## Restored

- Notification bell
- Right-side notification drawer
- Notification center
- Filters
- Preferences form
- Template admin page
- Delivery logs page
- Runtime/store bridge

## Kept

- `notifications`
- `notificationPreferences`
- `notificationTokens`
- `notificationDeliveries`
- FCM client service
- Firestore inbox client service

## Runtime integration

During app boot:

```js
import { configureNotificationsRuntime } from '@/features/notifications'
import { useAppStore } from '@/app/stores/appStore'

const store = useAppStore()

configureNotificationsRuntime({
  rootStore: store,
  getCurrentUser: () => store.currentUser,
})
```

Use `allowDemoMode: true` only for isolated previews.
