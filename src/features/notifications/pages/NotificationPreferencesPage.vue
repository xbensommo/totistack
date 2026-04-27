<script setup>
import { storeToRefs } from 'pinia'
import NotificationPreferencesForm from '../components/NotificationPreferencesForm.vue'
import { useNotificationsStore } from '../stores/useNotificationsStore.js'

const store = useNotificationsStore()
const { preferences } = storeToRefs(store)

function savePreferences(payload) {
  store.setPreferences(payload)
}
</script>

<template>
  <section class="space-y-6">
    <header class="rounded-[2rem] border p-6 sm:p-8">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted,#6b7280)]">
        User settings
      </p>
      <h1 class="mt-3 text-2xl font-semibold sm:text-3xl">Notification Preferences</h1>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--color-muted,#6b7280)]">
        Decide which categories and channels can reach you.
      </p>
    </header>

    <NotificationPreferencesForm
      :model-value="preferences"
      @submit="savePreferences"
      @update:model-value="store.setPreferences($event)"
    />
  </section>
</template>

<style scoped>
header {
  background: var(--color-surface, #ffffff);
  border-color: var(--color-border, #e5e7eb);
}
</style>
