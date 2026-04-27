<script setup>
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NotificationFilters from '../components/NotificationFilters.vue'
import NotificationList from '../components/NotificationList.vue'
import { useNotificationsStore } from '../stores/useNotificationsStore.js'

const router = useRouter()
const store = useNotificationsStore()
const { filters, visibleItems, unreadCount, loading, error } = storeToRefs(store)

onMounted(() => {
  store.loadInbox().catch(() => {})
})

function openItem(item) {
  if (item.actionUrl) {
    router.push(item.actionUrl)
    return
  }
  store.markRead(item.id)
}

function archiveItem(item) {
  store.archive(item.id)
}
</script>

<template>
  <section class="page-shell space-y-6">
    <header class="page-hero rounded-[2rem] border p-6 sm:p-8">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted,#6b7280)]">
        Cross-cutting feature
      </p>
      <div class="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-2xl font-semibold sm:text-3xl">Notification Center</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--color-muted,#6b7280)]">
            One place for CRM, booking, forms, auth, documents, finance, and security events.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="stat-card rounded-2xl border p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted,#6b7280)]">Unread</p>
            <p class="mt-2 text-xl font-semibold">{{ unreadCount }}</p>
          </div>
          <div class="stat-card rounded-2xl border p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted,#6b7280)]">Status</p>
            <p class="mt-2 text-xl font-semibold">{{ loading ? 'Syncing' : 'Live' }}</p>
          </div>
          <div class="stat-card rounded-2xl border p-4 sm:col-span-1 col-span-2">
            <button class="action-primary w-full rounded-full px-4 py-3 text-sm font-semibold" @click="store.markAllRead()">
              Mark all read
            </button>
          </div>
        </div>
      </div>
    </header>

    <p v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ error.message || error }}
    </p>

    <NotificationFilters
      :model-value="filters"
      @update:model-value="store.setFilters($event)"
    />

    <NotificationList
      :items="visibleItems"
      @archive="archiveItem"
      @mark-read="store.markRead($event.id)"
      @open="openItem"
    />
  </section>
</template>

<style scoped>
.page-hero,
.stat-card {
  background: var(--color-surface, #ffffff);
  border-color: var(--color-border, #e5e7eb);
}

.action-primary {
  color: white;
  background: var(--color-primary, #1860a8);
}
</style>
