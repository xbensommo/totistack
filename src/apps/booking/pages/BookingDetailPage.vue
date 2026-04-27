<template>
  <EntityPageShell
    eyebrow="Booking"
    :title="booking?.title || 'Booking Details'"
    description="Review the booking record, booking origin, assignment data, and reminder status."
  >
    <template #actions>
      <RouterLink
        to="/bookings"
        class="btn-secondary"
      >
        Back
      </RouterLink>
      <button
        v-if="booking && booking.status === 'pending'"
        type="button"
        class="btn-primary"
        @click="confirmBooking"
      >
        Confirm
      </button>
      <button
        v-if="booking && !['cancelled', 'completed'].includes(booking.status)"
        type="button"
        class="btn-outline"
        @click="cancelBooking"
      >
        Cancel
      </button>
    </template>

    <div v-if="booking" class="grid gap-5 xl:grid-cols-[2fr,1fr]">
      <div class="space-y-5">
        <section class="card">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p class="text-caption">
                {{ booking.bookingNumber || 'Booking number pending' }}
              </p>
              <h2 class="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                {{ booking.title || booking.serviceName || 'Untitled booking' }}
              </h2>
            </div>
            <StatusBadge :status="booking.status || 'pending'" />
          </div>

          <dl class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Customer</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.customerName || '—' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Email</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.customerEmail || '—' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Phone</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.customerPhone || '—' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Booking origin</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.bookingChannel || booking.customerType || '—' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Start</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ formatDate(booking.startTime) }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">End</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ formatDate(booking.endTime) }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Service</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.serviceName || '—' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Location</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.locationName || '—' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Resource</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.resourceType || '—' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Assigned to</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.assignedToName || '—' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Attendees</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.attendeeCount || booking.attendees?.length || 1 }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Amount</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ formatMoney(booking.amount, booking.currency) }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Payment</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.paymentStatus || 'pending' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Access code</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.accessCode || '—' }}</dd>
            </div>
            <div class="card-soft rounded-[1.25rem]">
              <dt class="text-caption">Reminder status</dt>
              <dd class="mt-2 text-sm text-[var(--color-text)]">{{ booking.reminderStatus || 'disabled' }}</dd>
            </div>
          </dl>

          <div v-if="booking.description" class="mt-6 border-t border-theme pt-6">
            <h3 class="text-sm font-semibold text-[var(--color-text)]">Description</h3>
            <p class="mt-2 text-sm leading-6 text-soft">{{ booking.description }}</p>
          </div>

          <div v-if="booking.specialRequests" class="mt-6 border-t border-theme pt-6">
            <h3 class="text-sm font-semibold text-[var(--color-text)]">Special Requests</h3>
            <p class="mt-2 text-sm leading-6 text-soft">{{ booking.specialRequests }}</p>
          </div>

          <div v-if="booking.notes" class="mt-6 border-t border-theme pt-6">
            <h3 class="text-sm font-semibold text-[var(--color-text)]">Internal Notes</h3>
            <p class="mt-2 text-sm leading-6 text-soft">{{ booking.notes }}</p>
          </div>
        </section>

        <section class="card">
          <h3 class="section-title">Reminder Timeline</h3>
          <p class="mt-2 text-sm text-muted">{{ booking.reminderSummary || 'No reminders scheduled.' }}</p>

          <div v-if="booking.reminders?.length" class="mt-5 space-y-3">
            <div
              v-for="(reminder, index) in booking.reminders"
              :key="`${reminder.channel || 'channel'}-${reminder.type || 'type'}-${index}`"
              class="status-strip"
            >
              <div>
                <span class="font-semibold text-[var(--color-text)]">{{ reminder.channel || 'channel' }} / {{ reminder.type || 'manual' }}</span>
                <p class="mt-1 text-sm text-muted">{{ formatDate(reminder.time) }}</p>
              </div>
              <span class="badge">{{ reminder.status || (reminder.sent ? 'sent' : 'scheduled') }}</span>
            </div>
          </div>
        </section>
      </div>

      <aside class="space-y-5">
        <section class="card">
          <h3 class="section-title">Ops Actions</h3>
          <div class="mt-4 grid gap-3">
            <button
              type="button"
              class="btn-secondary"
              @click="checkInBooking"
            >
              Mark checked in
            </button>
            <button
              type="button"
              class="btn-secondary"
              @click="completeBooking"
            >
              Mark completed
            </button>
            <button
              type="button"
              class="btn-outline"
              @click="queueEmailReminder"
            >
              Queue email reminder
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
          class="btn-primary"
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
import { useAppStore } from '@app/stores/appStore'
import { createBookingServices } from '../services/bookingService.js'
import EntityPageShell from '../components/EntityPageShell.vue'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'

const route = useRoute()
const store = useAppStore()
const bookingService = createBookingServices({ store })
const booking = ref(null)

onMounted(loadBooking)

async function loadBooking() {
  try {
    booking.value = await bookingService.getById(route.params.id)
  } catch (error) {
    console.error('[BookingDetailPage] Failed to load booking.', error)
    booking.value = null
  }
}

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

async function queueEmailReminder() {
  if (!booking.value?.id) return
  booking.value = await bookingService.queueReminder(booking.value.id, 'email')
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
