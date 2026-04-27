<template>
  <EntityPageShell
    eyebrow="Public"
    title="Manage Booking"
    description="Guests can look up a booking using the booking number or access code plus their email or phone number."
  >
    <div class="grid gap-5 xl:grid-cols-[1.3fr,1fr]">
      <form class="form-shell space-y-5" @submit.prevent="lookupBooking">
        <div class="status-strip">
          <div>
            <p class="text-sm font-semibold text-[var(--color-text)]">Quick lookup</p>
            <p class="mt-1 text-sm text-muted">Use the booking reference and your contact details to view the reservation.</p>
          </div>
          <div class="chip">Guest access</div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="field-label text-xs uppercase tracking-[0.18em]">Booking number / access code</span>
            <input v-model="form.reference" type="text" class="input-field" required />
          </label>

          <label class="space-y-2">
            <span class="field-label text-xs uppercase tracking-[0.18em]">Email or phone</span>
            <input v-model="form.contact" type="text" class="input-field" required />
          </label>
        </div>

        <p v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            class="btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Looking up...' : 'Find booking' }}
          </button>
          <RouterLink
            to="/bookings/new"
            class="btn-secondary"
          >
            Create new booking
          </RouterLink>
        </div>
      </form>

      <section class="card">
        <template v-if="booking">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-caption">{{ booking.bookingNumber }}</p>
              <h2 class="mt-3 text-2xl font-semibold text-[var(--color-text)]">{{ booking.title || booking.serviceName || 'Booking' }}</h2>
            </div>
            <StatusBadge :status="booking.status || 'pending'" />
          </div>

          <dl class="mt-6 space-y-4 text-sm text-soft">
            <div class="rounded-theme bg-surface-2 px-4 py-3">
              <dt class="font-semibold text-[var(--color-text)]">Customer</dt>
              <dd class="mt-1">{{ booking.customerName || '—' }}</dd>
            </div>
            <div class="rounded-theme bg-surface-2 px-4 py-3">
              <dt class="font-semibold text-[var(--color-text)]">When</dt>
              <dd class="mt-1">{{ formatDate(booking.startTime) }} — {{ formatDate(booking.endTime) }}</dd>
            </div>
            <div class="rounded-theme bg-surface-2 px-4 py-3">
              <dt class="font-semibold text-[var(--color-text)]">Location</dt>
              <dd class="mt-1">{{ booking.locationName || booking.resourceType || '—' }}</dd>
            </div>
            <div class="rounded-theme bg-surface-2 px-4 py-3">
              <dt class="font-semibold text-[var(--color-text)]">Reminder summary</dt>
              <dd class="mt-1">{{ booking.reminderSummary || 'No reminders scheduled.' }}</dd>
            </div>
            <div class="rounded-theme bg-surface-2 px-4 py-3">
              <dt class="font-semibold text-[var(--color-text)]">Access code</dt>
              <dd class="mt-1">{{ booking.accessCode || '—' }}</dd>
            </div>
          </dl>
        </template>

        <EmptyState
          v-else
          title="No booking loaded"
          description="Enter the reference and customer contact to fetch the booking."
        />
      </section>
    </div>
  </EntityPageShell>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@app/stores/appStore'
import { createBookingServices } from '../services/bookingService.js'
import EntityPageShell from '../components/EntityPageShell.vue'
import EmptyState from '../components/EmptyState.vue'
import StatusBadge from '../components/StatusBadge.vue'

const store = useAppStore()
const bookingService = createBookingServices({ store })
const loading = ref(false)
const errorMessage = ref('')
const booking = ref(null)

const form = reactive({
  reference: '',
  contact: '',
})

async function lookupBooking() {
  loading.value = true
  errorMessage.value = ''

  try {
    booking.value = await bookingService.getByReference(form.reference, form.contact)

    if (!booking.value) {
      errorMessage.value = 'No matching booking was found for those details.'
    }
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to look up booking.'
    booking.value = null
  } finally {
    loading.value = false
  }
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
</script>
