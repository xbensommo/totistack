<script setup>
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useNotificationsStore } from '../stores/useNotificationsStore.js'

const store = useNotificationsStore()
const { logs } = storeToRefs(store)

onMounted(() => {
  store.loadLogs().catch(() => {})
})
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border p-6 sm:p-8">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted,#6b7280)]">
        Admin
      </p>
      <h1 class="mt-3 text-2xl font-semibold sm:text-3xl">Delivery Logs</h1>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--color-muted,#6b7280)]">
        Review provider outcomes and retry failures from one place.
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <article v-for="log in logs" :key="log.id" class="rounded-[2rem] border p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted,#6b7280)]">
              {{ log.channel || 'in_app' }}
            </p>
            <h2 class="mt-2 text-base font-semibold">{{ log.notificationId || log.notification_id || log.id }}</h2>
          </div>
          <span class="status-chip">{{ log.status || 'unknown' }}</span>
        </div>
        <p class="mt-3 text-sm text-[color:var(--color-muted,#6b7280)]">
          Provider: {{ log.provider || log.deliveryProvider || 'database' }}
        </p>
        <p v-if="log.errorMessage" class="mt-2 text-sm text-rose-700">{{ log.errorMessage }}</p>
        <button class="retry-btn mt-5 rounded-full px-4 py-2 text-sm font-semibold" type="button">
          Retry
        </button>
      </article>

      <div v-if="!logs.length" class="rounded-[2rem] border p-6 text-center text-sm text-[color:var(--color-muted,#6b7280)] md:col-span-2">
        No delivery logs found.
      </div>
    </div>
  </section>
</template>

<style scoped>
header,
article,
div.rounded-\[2rem\] {
  background: var(--color-surface, #ffffff);
  border-color: var(--color-border, #e5e7eb);
}

.status-chip {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  color: white;
  background: var(--color-secondary, #4a90e2);
}

.retry-btn {
  color: white;
  background: var(--color-primary, #1860a8);
}
</style>
