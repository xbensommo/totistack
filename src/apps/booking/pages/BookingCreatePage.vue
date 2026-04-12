<template>
  <EntityPageShell
    eyebrow="Booking"
    title="Create Booking"
    description="Starter booking form built to be extended for your domain, services, or resources."
  >
    <div class="grid gap-5 xl:grid-cols-[2fr,1fr]">
      <form class="space-y-5 rounded-2xl border border-slate-200 bg-white p-5" @submit.prevent="submit">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer name</span>
            <input v-model="form.customerName" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" required />
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer email</span>
            <input v-model="form.customerEmail" type="email" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" />
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Title</span>
            <input v-model="form.title" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" required />
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resource type</span>
            <input v-model="form.resourceType" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" placeholder="Room, staff, vehicle..." />
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Start</span>
            <input v-model="form.startTime" type="datetime-local" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" required />
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">End</span>
            <input v-model="form.endTime" type="datetime-local" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" required />
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Amount</span>
            <input v-model.number="form.amount" type="number" min="0" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400" />
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Currency</span>
            <input v-model="form.currency" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase outline-none focus:border-slate-400" />
          </label>
        </div>

        <label class="space-y-2 block">
          <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Description</span>
          <textarea v-model="form.description" rows="4" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"></textarea>
        </label>

        <label class="space-y-2 block">
          <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Internal notes</span>
          <textarea v-model="form.notes" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"></textarea>
        </label>

        <div class="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Save booking
          </button>
          <RouterLink
            to="/bookings"
            class="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </RouterLink>
        </div>
      </form>

      <aside class="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 class="text-lg font-semibold text-slate-950">Starter Notes</h2>
        <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <li>Hook this form into custom resource availability rules when your domain requires it.</li>
          <li>Add client lookup, service presets, deposits, or staff assignment later without changing the app contract.</li>
          <li>Keep shared auth, RBAC, routing, and provider creation in Totistack root only.</li>
        </ul>
      </aside>
    </div>
  </EntityPageShell>
</template>

<script setup>
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { createBookingServices } from '../services/bookingService.js'
import EntityPageShell from '../components/EntityPageShell.vue'

const router = useRouter()
const store = useAppStore()
const bookingService = createBookingServices({ store })

const form = reactive({
  customerName: '',
  customerEmail: '',
  title: '',
  resourceType: '',
  startTime: '',
  endTime: '',
  amount: 0,
  currency: 'USD',
  description: '',
  notes: '',
})

async function submit() {
  try {
    const created = await bookingService.create({
      ...form,
      startTime: form.startTime,
      endTime: form.endTime,
    })

    if (created?.id) {
      await router.push(`/bookings/${created.id}`)
      return
    }

    await router.push('/bookings')
  } catch (error) {
    console.error('[BookingCreatePage] Failed to create booking.', error)
  }
}
</script>
