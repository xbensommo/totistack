<script setup>
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '../stores/useNotificationsStore.js'

const store = useNotificationsStore()
const { unreadCount, drawerOpen } = storeToRefs(store)

function toggleDrawer() {
  store.setDrawerOpen(!drawerOpen.value)
}
</script>

<template>
  <button
    type="button"
    class="notification-bell inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5"
    @click="toggleDrawer"
  >
    <span class="relative inline-flex h-5 w-5 items-center justify-center">
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M6 9a6 6 0 0 1 12 0v4.5l1.5 2.5H4.5L6 13.5V9Z" />
        <path d="M10 18a2 2 0 0 0 4 0" />
      </svg>
      <span
        v-if="unreadCount"
        class="badge absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </span>
    <span class="hidden sm:inline">Notifications</span>
  </button>
</template>

<style scoped>
.notification-bell {
  color: var(--color-text, #111827);
  background: var(--color-surface, #ffffff);
  border-color: color-mix(in srgb, var(--color-border, #d1d5db) 75%, transparent);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.badge {
  color: #ffffff;
  background: var(--color-primary, #1860a8);
}
</style>
