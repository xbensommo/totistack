<template>
  <PortalPageShell
    eyebrow="Portal"
    title="Portal settings"
    description="External users need basic preferences without exposing internal system controls."
  >
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="submit">
        <label class="grid gap-2 text-sm text-slate-700">
          <span class="font-medium">Theme</span>
          <select v-model="form.theme" class="rounded-xl border border-slate-300 px-4 py-2 outline-none ring-0 focus:border-slate-500">
            <option value="">Use default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label class="grid gap-2 text-sm text-slate-700">
          <span class="font-medium">Locale</span>
          <input v-model="form.locale" class="rounded-xl border border-slate-300 px-4 py-2 outline-none ring-0 focus:border-slate-500" />
        </label>
        <label class="grid gap-2 text-sm text-slate-700 md:col-span-2">
          <span class="font-medium">Notification channels</span>
          <input
            v-model="channelsInput"
            class="rounded-xl border border-slate-300 px-4 py-2 outline-none ring-0 focus:border-slate-500"
            placeholder="email, whatsapp, in_app"
          />
        </label>
        <label class="flex items-center gap-3 text-sm text-slate-700 md:col-span-2">
          <input v-model="form.compactMode" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
          <span>Use compact mode</span>
        </label>
        <div class="md:col-span-2">
          <button type="submit" class="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Save preferences
          </button>
        </div>
      </form>
    </section>
  </PortalPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import PortalPageShell from '../components/PortalPageShell.vue'
import { usePortal } from '../composables/usePortal.js'

const { bootstrap, preferences, savePreferences } = usePortal()

const form = reactive({
  theme: '',
  locale: '',
  compactMode: false,
  notificationChannels: [],
})

const channelsInput = computed({
  get: () => form.notificationChannels.join(', '),
  set: (value) => {
    form.notificationChannels = String(value || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  },
})

watch(
  preferences,
  (value) => {
    if (!value) return
    form.theme = value.theme || ''
    form.locale = value.locale || ''
    form.compactMode = Boolean(value.compactMode)
    form.notificationChannels = Array.isArray(value.notificationChannels) ? value.notificationChannels : []
  },
  { immediate: true },
)

async function submit() {
  await savePreferences({ ...form })
}

onMounted(() => {
  bootstrap().catch(() => {})
})
</script>
