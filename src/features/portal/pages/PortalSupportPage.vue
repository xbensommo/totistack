<template>
  <PortalPageShell
    eyebrow="Portal"
    title="Support"
    description="Support is a deliberate, auditable action surface instead of exposing internal workflow controls directly to external users."
  >
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <form class="grid gap-4 lg:grid-cols-2" @submit.prevent="submit">
        <label class="grid gap-2 text-sm text-slate-700">
          <span class="font-medium">Subject</span>
          <input v-model="form.subject" class="rounded-xl border border-slate-300 px-4 py-2 outline-none ring-0 focus:border-slate-500" />
        </label>
        <label class="grid gap-2 text-sm text-slate-700">
          <span class="font-medium">Priority</span>
          <select v-model="form.priority" class="rounded-xl border border-slate-300 px-4 py-2 outline-none ring-0 focus:border-slate-500">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>
        <label class="grid gap-2 text-sm text-slate-700 lg:col-span-2">
          <span class="font-medium">Message</span>
          <textarea
            v-model="form.message"
            rows="6"
            class="rounded-2xl border border-slate-300 px-4 py-3 outline-none ring-0 focus:border-slate-500"
          />
        </label>
        <div class="lg:col-span-2">
          <button type="submit" class="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Submit request
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="text-base font-semibold text-slate-950">Recent support tickets</h2>
      <ul v-if="tickets.length" class="mt-4 space-y-3">
        <li v-for="ticket in tickets" :key="ticket.id || ticket.subject" class="rounded-xl border border-slate-100 px-4 py-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-slate-950">{{ ticket.subject }}</p>
              <p class="text-xs text-slate-500">{{ ticket.status }} · {{ ticket.priority || 'normal' }}</p>
            </div>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{{ ticket.category }}</span>
          </div>
        </li>
      </ul>
      <PortalEmptyState
        v-else
        title="No support tickets"
        description="External users should not have to chase staff manually. This page centralizes support history."
      />
    </section>
  </PortalPageShell>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import PortalEmptyState from '../components/PortalEmptyState.vue'
import PortalPageShell from '../components/PortalPageShell.vue'
import { usePortal } from '../composables/usePortal.js'

const { bootstrap, createSupportTicket, tickets } = usePortal()

const form = reactive({
  subject: 'Portal support request',
  priority: 'normal',
  message: '',
})

async function submit() {
  await createSupportTicket({ ...form })
  form.message = ''
}

onMounted(() => {
  bootstrap().catch(() => {})
})
</script>
