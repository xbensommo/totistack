<template>
  <EntityPageShell
    eyebrow="Booking"
    :title="booking?.title || 'Booking Details'"
    description="Review the booking record, timeline details, and operational status."
  >
    <template #actions>
      <RouterLink
        to="/bookings"
        class="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Back
      </RouterLink>
      <button
        v-if="booking && booking.status === 'pending'"
        type="button"
        class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        @click="confirmBooking"
      >
        Confirm
      </button>
      <button
        v-if="booking && !['cancelled', 'completed'].includes(booking.status)"
        type="button"
        class="inline-flex items-center rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
        @click="cancelBooking"
      >
        Cancel
      </button>
    </template>

    <div v-if="booking" class="grid gap-5 xl:grid-cols-[2fr,1fr]">
      <div class="space-y-5">
        <section class="rounded-2xl border border-slate-200 bg-white p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {{ booking.bookingNumber || 'Booking number pending' }}
              </p>
              <h2 class="mt-2 text-xl font-semibold text-slate-950">
                {{ booking.title || 'Untitled booking' }}
              </h2>
            </div>
            <StatusBadge :status="booking.status || 'pending'" />
          </div>

          <dl class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer</dt>
              <dd class="mt-1 text-sm text-slate-800">{{ booking.customerName || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</dt>
              <dd class="mt-1 text-sm text-slate-800">{{ booking.customerEmail || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Start</dt>
              <dd class="mt-1 text-sm text-slate-800">{{ formatDate(booking.startTime) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">End</dt>
              <dd class="mt-1 text-sm text-slate-800">{{ formatDate(booking.endTime) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Amount</dt>
              <dd class="mt-1 text-sm text-slate-800">{{ formatMoney(booking.amount, booking.currency) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resource</dt>
              <dd class="mt-1 text-sm text-slate-800">{{ booking.resourceType || '—' }}</dd>
            </div>
          </dl>

          <div v-if="booking.description" class="mt-5 border-t border-slate-200 pt-5">
            <h3 class="text-sm font-semibold text-slate-900">Description</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ booking.description }}</p>
          </div>

          <div v-if="booking.notes" class="mt-5 border-t border-slate-200 pt-5">
            <h3 class="text-sm font-semibold text-slate-900">Internal Notes</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ booking.notes }}</p>
          </div>
        </section>
      </div>

      <aside class="space-y-5">
        <section class="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Ops Actions</h3>
          <div class="mt-4 grid gap-3">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              @click="checkInBooking"
            >
              Mark checked in
            </button>
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              @click="completeBooking"
            >
              Mark completed
            </button>
          </div>
        </section>
      </aside>
    </div>

    <EmptyState
      v-else
      title="Booking not found"
      description="The requested booking record could not be loaded."
    >
      <template #actions>
        <RouterLink
          to="/bookings"
          class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Back to bookings
        </RouterLink>
      </template>
    </EmptyState>
  </EntityPageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { createBookingServices } from '../services/bookingService.js'
import EntityPageShell from '../components/EntityPageShell.vue'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const store = useAppStore()
const bookingService = createBookingServices({ store })
const booking = ref(null)

onMounted(async () => {
  try {
    booking.value = await bookingService.getById(route.params.id)
  } catch (error) {
    console.error('[BookingDetailPage] Failed to load booking.', error)
    booking.value = null
  }
})

async function confirmBooking() {
  if (!booking.value?.id) return
  booking.value = await bookingService.confirm(booking.value.id)
}

async function cancelBooking() {
  if (!booking.value?.id) return
  booking.value = await bookingService.cancel(booking.value.id, 'Cancelled from detail page')
}

async function checkInBooking() {
  if (!booking.value?.id) return
  booking.value = await bookingService.checkIn(booking.value.id)
}

async function completeBooking() {
  if (!booking.value?.id) return
  booking.value = await bookingService.complete(booking.value.id)
}

function formatDate(value) {
  const date =
    value instanceof Date
      ? value
      : typeof value?.toDate === 'function'
        ? value.toDate()
        : new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatMoney(value, currency = 'USD') {
  const amount = Number(value || 0)

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}
</script>
