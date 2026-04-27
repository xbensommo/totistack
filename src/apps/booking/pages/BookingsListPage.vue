<template>
  <EntityPageShell
    eyebrow="Operations"
    title="Bookings"
    description="Track reservations, public booking intake, reminder readiness, and customer activity from one place."
  >
    <template #actions>
      <RouterLink
        to="/bookings/new"
        class="btn-primary"
      >
        New booking
      </RouterLink>
    </template>

    <template #metrics>
      <StatCard label="Total" :value="metrics.total" hint="Visible records in the current store snapshot." icon="All" />
      <StatCard label="Pending" :value="metrics.pending" hint="Require confirmation or follow-up." icon="Queue" />
      <StatCard label="Public" :value="metrics.public" hint="Created without a signed-in account." icon="Guest" />
      <StatCard label="Reminders ready" :value="metrics.reminderReady" hint="Have reminder jobs scheduled." icon="Bell" />
    </template>

    <div class="space-y-5">
      <BookingFilters v-model="filters" />

      <div class="status-strip">
        <p class="text-sm text-soft">
          {{ loading ? 'Loading bookings...' : `Showing ${filteredItems.length} bookings` }}
        </p>

        <button
          type="button"
          class="btn-secondary btn-sm"
          @click="reload"
        >
          Refresh
        </button>
      </div>

      <BookingTable :items="filteredItems">
        <template #actions="{ item }">
          <RouterLink
            :to="`/bookings/${item.id}`"
            class="btn-outline btn-sm"
          >
            View
          </RouterLink>
        </template>

        <template #empty>
          <EmptyState
            title="No bookings found"
            description="Once your team starts taking bookings, they will appear here."
          >
            <template #actions>
              <RouterLink
                to="/bookings/new"
                class="btn-primary"
              >
                Create booking
              </RouterLink>
            </template>
          </EmptyState>
        </template>
      </BookingTable>
    </div>
  </EntityPageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@app/stores/appStore'
import { createBookingServices } from '../services/bookingService.js'
import EntityPageShell from '../components/EntityPageShell.vue'
import StatCard from '../components/StatCard.vue'
import BookingFilters from '../components/BookingFilters.vue'
import BookingTable from '../components/BookingTable.vue'
import EmptyState from '../components/EmptyState.vue'

const store = useAppStore()
const bookingService = createBookingServices({ store })

const filters = ref({
  search: '',
  status: '',
  bookingChannel: '',
  paymentStatus: '',
  startDate: '',
  endDate: '',
})

const loading = computed(() => Boolean(store.loading?.value || store.loading || false))
const sourceItems = computed(() => {
  const rootState = store.bookings?.items || store.bookings?.value?.items || store.bookings?.value || store.bookings || []
  return Array.isArray(rootState) ? rootState : []
})

const filteredItems = computed(() => {
  return sourceItems.value.filter((item) => {
    const haystack = [
      item.bookingNumber,
      item.accessCode,
      item.title,
      item.serviceName,
      item.customerName,
      item.customerEmail,
      item.customerPhone,
      item.locationName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const searchOk = !filters.value.search || haystack.includes(filters.value.search.toLowerCase())
    const statusOk = !filters.value.status || item.status === filters.value.status
    const channelOk = !filters.value.bookingChannel || item.bookingChannel === filters.value.bookingChannel
    const paymentOk = !filters.value.paymentStatus || item.paymentStatus === filters.value.paymentStatus

    const startDate = normalizeDate(item.startTime)
    const afterStart = !filters.value.startDate || (startDate && startDate >= new Date(filters.value.startDate))
    const beforeEnd = !filters.value.endDate || (startDate && startDate <= new Date(`${filters.value.endDate}T23:59:59`))

    return searchOk && statusOk && channelOk && paymentOk && afterStart && beforeEnd
  })
})

const metrics = computed(() => {
  const items = sourceItems.value
  return {
    total: items.length,
    pending: items.filter((item) => item.status === 'pending').length,
    public: items.filter((item) => item.bookingChannel === 'public').length,
    reminderReady: items.filter((item) => item.reminderStatus === 'scheduled' || item.reminderStatus === 'queued').length,
  }
})

onMounted(() => {
  reload()
})

async function reload() {
  try {
    await bookingService.list({
      orderBy: 'startTime',
      orderDirection: 'asc',
      limit: 50,
    })
  } catch (error) {
    console.error('[BookingListPage] Failed to load bookings.', error)
  }
}

function normalizeDate(value) {
  const date =
    value instanceof Date
      ? value
      : typeof value?.toDate === 'function'
        ? value.toDate()
        : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}
</script>
