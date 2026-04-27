<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '../stores/useNotificationsStore.js'
import NotificationList from './NotificationList.vue'

const router = useRouter()
const store = useNotificationsStore()
const { drawerOpen, recentItems } = storeToRefs(store)

function closeDrawer() {
  store.setDrawerOpen(false)
}

function openItem(item) {
  store.markRead(item.id)
  closeDrawer()

  if (item.actionUrl) {
    router.push(item.actionUrl)
    return
  }

  router.push('/notifications')
}

function archiveItem(item) {
  store.archive(item.id)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="drawerOpen" class="fixed inset-0 z-50">
      <button class="overlay absolute inset-0" type="button" @click="closeDrawer" />
      <aside class="drawer absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto p-4 sm:p-6">
        <div class="rounded-[1.75rem] border p-5">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted,#6b7280)]">
                Live updates
              </p>
              <h2 class="mt-2 text-lg font-semibold">Notifications</h2>
            </div>

            <div class="flex items-center gap-2">
              <RouterLink class="inline-flex rounded-full border px-3 py-2 text-sm font-medium" to="/notifications">
                Open center
              </RouterLink>
              <button class="inline-flex rounded-full border px-3 py-2 text-sm font-medium" type="button" @click="closeDrawer">
                Close
              </button>
            </div>
          </div>

          <div class="mt-5">
            <NotificationList
              :items="recentItems"
              empty-title="No recent notifications"
              empty-text="Everything important from the system will appear here."
              @archive="archiveItem"
              @mark-read="store.markRead($event.id)"
              @open="openItem"
            />
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  background: rgba(15, 23, 42, 0.4);
}

.drawer {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.drawer > div {
  min-height: 100%;
  background: var(--color-surface, #ffffff);
  border-color: var(--color-border, #e5e7eb);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.15);
}
</style>
