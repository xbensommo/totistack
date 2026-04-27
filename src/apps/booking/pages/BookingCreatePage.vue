<template>
  <EntityPageShell
    eyebrow="Booking"
    :title="currentUser?.uid ? 'Create Booking' : 'Book an Appointment'"
    :description="currentUser?.uid
      ? 'Create an internal or customer booking with reminder settings and assignment data.'
      : 'Guests can book without signing in. Use your email or phone so reminders and updates can reach you.'"
  >
    <template #actions>
      <RouterLink
        v-if="currentUser?.uid"
        to="/bookings"
        class="btn-secondary"
      >
        Back to bookings
      </RouterLink>
      <RouterLink
        v-else
        to="/bookings/manage"
        class="btn-secondary"
      >
        Manage existing booking
      </RouterLink>
    </template>

    <div class="grid gap-5 xl:grid-cols-[2fr,1fr]">
      <form class="form-shell space-y-6" @submit.prevent="submit">
        <div class="status-strip">
          <div>
            <p class="text-sm font-semibold text-[var(--color-text)]">Mode</p>
            <p class="mt-1 text-sm text-muted">
              {{ currentUser?.uid ? 'Authenticated booking flow' : 'Public guest booking flow' }}
            </p>
          </div>

          <div class="chip">
            {{ currentUser?.uid ? 'Signed in' : 'Guest' }}
          </div>
        </div>

        <section class="form-section space-y-4">
          <div>
            <p class="section-label">Customer</p>
            <h2 class="mt-3 text-lg font-semibold text-[var(--color-text)]">Customer details</h2>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Customer name</span>
              <input v-model="form.customerName" type="text" class="input-field" required />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Customer email</span>
              <input v-model="form.customerEmail" type="email" class="input-field" />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Customer phone</span>
              <input v-model="form.customerPhone" type="text" class="input-field" placeholder="081..." />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Attendees</span>
              <input v-model.number="form.attendeeCount" type="number" min="1" step="1" class="input-field" />
            </label>
          </div>
        </section>

        <section class="form-section space-y-4">
          <div>
            <p class="section-label">Booking</p>
            <h2 class="mt-3 text-lg font-semibold text-[var(--color-text)]">Booking details</h2>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Booking title</span>
              <input v-model="form.title" type="text" class="input-field" required />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Service name</span>
              <input v-model="form.serviceName" type="text" class="input-field" placeholder="Consultation, table booking..." />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Location</span>
              <input v-model="form.locationName" type="text" class="input-field" placeholder="Branch, room, venue..." />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Resource type</span>
              <input v-model="form.resourceType" type="text" class="input-field" placeholder="Room, staff, vehicle..." />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Assigned staff</span>
              <input v-model="form.assignedToName" type="text" class="input-field" placeholder="Optional staff owner" />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Payment status</span>
              <select v-model="form.paymentStatus" class="select-field">
                <option value="pending">Pending</option>
                <option value="deposit_due">Deposit due</option>
                <option value="paid">Paid</option>
              </select>
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Start</span>
              <input v-model="form.startTime" type="datetime-local" class="input-field" required />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">End</span>
              <input v-model="form.endTime" type="datetime-local" class="input-field" required />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Amount</span>
              <input v-model.number="form.amount" type="number" min="0" step="0.01" class="input-field" />
            </label>

            <label class="space-y-2">
              <span class="field-label text-xs uppercase tracking-[0.18em]">Currency</span>
              <input v-model="form.currency" type="text" class="input-field uppercase" />
            </label>
          </div>
        </section>

        <section class="form-section space-y-4">
          <div>
            <p class="section-label">Notes</p>
            <h2 class="mt-3 text-lg font-semibold text-[var(--color-text)]">Additional context</h2>
          </div>

          <label class="block space-y-2">
            <span class="field-label text-xs uppercase tracking-[0.18em]">Description</span>
            <textarea v-model="form.description" rows="3" class="textarea-field"></textarea>
          </label>

          <label class="block space-y-2">
            <span class="field-label text-xs uppercase tracking-[0.18em]">Special requests</span>
            <textarea v-model="form.specialRequests" rows="3" class="textarea-field"></textarea>
          </label>

          <label v-if="currentUser?.uid" class="block space-y-2">
            <span class="field-label text-xs uppercase tracking-[0.18em]">Internal notes</span>
            <textarea v-model="form.notes" rows="3" class="textarea-field"></textarea>
          </label>
        </section>

        <section class="form-section space-y-4">
          <div>
            <p class="section-label">Reminders</p>
            <h2 class="mt-3 text-lg font-semibold text-[var(--color-text)]">Reminder channels</h2>
            <p class="mt-2 text-sm text-muted">Pick how reminder jobs should be scheduled.</p>
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <label
              class="option-card"
              :class="{ 'option-card-active': form.reminderChannels.includes('email') }"
            >
              <input v-model="form.reminderChannels" type="checkbox" value="email" class="sr-only" />
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(109,94,252,0.08)] text-xs font-semibold text-primary">
                E
              </span>
              Email reminder
            </label>
            <label
              class="option-card"
              :class="{ 'option-card-active': form.reminderChannels.includes('sms') }"
            >
              <input v-model="form.reminderChannels" type="checkbox" value="sms" class="sr-only" />
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(109,94,252,0.08)] text-xs font-semibold text-primary">
                S
              </span>
              SMS reminder
            </label>
            <label
              class="option-card"
              :class="{ 'option-card-active': form.reminderChannels.includes('whatsapp') }"
            >
              <input v-model="form.reminderChannels" type="checkbox" value="whatsapp" class="sr-only" />
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(109,94,252,0.08)] text-xs font-semibold text-primary">
                W
              </span>
              WhatsApp reminder
            </label>
          </div>
        </section>

        <p v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            class="btn-primary"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save booking' }}
          </button>
          <RouterLink
            :to="currentUser?.uid ? '/bookings' : '/bookings/manage'"
            class="btn-secondary"
          >
            Cancel
          </RouterLink>
        </div>
      </form>

      <aside class="space-y-5">
        <section class="card-dark">
          <p class="section-label !bg-white/10 !text-white">Flow</p>
          <h2 class="mt-4 text-xl font-semibold text-white">What this improved flow does</h2>
          <ul class="mt-4 space-y-3 text-sm leading-6 text-white/75">
            <li>Allows both guest and authenticated bookings through the same app page.</li>
            <li>Captures service, location, assignment, attendee count, and payment state.</li>
            <li>Schedules reminder placeholder jobs for email, SMS, or WhatsApp.</li>
          </ul>
        </section>

        <section v-if="createdBooking" class="card border-[rgba(22,199,132,0.18)] bg-[rgba(22,199,132,0.08)]">
          <h2 class="text-lg font-semibold text-[var(--color-text)]">Booking saved</h2>
          <dl class="mt-4 space-y-3 text-sm text-soft">
            <div class="rounded-theme bg-surface px-4 py-3">
              <dt class="font-semibold text-[var(--color-text)]">Reference</dt>
              <dd class="mt-1">{{ createdBooking.bookingNumber }}</dd>
            </div>
            <div class="rounded-theme bg-surface px-4 py-3">
              <dt class="font-semibold text-[var(--color-text)]">Access code</dt>
              <dd class="mt-1">{{ createdBooking.accessCode || '—' }}</dd>
            </div>
            <div class="rounded-theme bg-surface px-4 py-3">
              <dt class="font-semibold text-[var(--color-text)]">Reminder summary</dt>
              <dd class="mt-1">{{ createdBooking.reminderSummary || 'No reminders scheduled.' }}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  </EntityPageShell>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@app/stores/appStore'
import { createBookingServices } from '../services/bookingService.js'
import EntityPageShell from '../components/EntityPageShell.vue'

const store = useAppStore()
const bookingService = createBookingServices({ store })

const currentUser = computed(() => store.currentUser?.value || store.currentUser || null)
const saving = ref(false)
const errorMessage = ref('')
const createdBooking = ref(null)

const form = reactive({
  customerName: currentUser.value?.displayName || '',
  customerEmail: currentUser.value?.email || '',
  customerPhone: '',
  attendeeCount: 1,
  title: '',
  serviceName: '',
  locationName: '',
  resourceType: '',
  assignedToName: '',
  startTime: '',
  endTime: '',
  amount: 0,
  currency: 'USD',
  paymentStatus: 'pending',
  description: '',
  specialRequests: '',
  notes: '',
  reminderChannels: ['email'],
})

async function submit() {
  errorMessage.value = ''
  saving.value = true

  try {
    createdBooking.value = await bookingService.create({
      ...form,
      startTime: form.startTime,
      endTime: form.endTime,
      bookingChannel: currentUser.value?.uid ? 'authenticated' : 'public',
    })
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to create booking.'
    console.error('[BookingCreatePage] Failed to create booking.', error)
  } finally {
    saving.value = false
  }
}
</script>
