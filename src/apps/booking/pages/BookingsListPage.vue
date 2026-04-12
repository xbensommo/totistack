<template>
  <EntityPageShell
    eyebrow="Operations"
    title="Bookings"
    description="Track reservations, upcoming appointments, and customer activity from one place."
  >
    <template #actions>
      <RouterLink
        to="/bookings/new"
        class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        New booking
      </RouterLink>
    </template>

    <template #metrics>
      <StatCard label="Total" :value="metrics.total" hint="Visible records in the current store snapshot." icon="All" />
      <StatCard label="Pending" :value="metrics.pending" hint="Require confirmation or follow-up." icon="Queue" />
      <StatCard label="Confirmed" :value="metrics.confirmed" hint="Ready to be fulfilled." icon="OK" />
      <StatCard label="Cancelled" :value="metrics.cancelled" hint="Useful for ops and quality review." icon="X" />
    </template>

    <div class="space-y-5">
      <BookingFilters v-model="filters" />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-500">
          {{ loading ? 'Loading bookings...' : `Showing ${filteredItems.length} bookings` }}
        </p>

        <button
          type="button"
          class="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          @click="reload"
        >
          Refresh
        </button>
      </div>

      <BookingTable :items="filteredItems">
        <template #actions="{ item }">
          <RouterLink
            :to="`/bookings/${item.id}`"
            class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
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
                class="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
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
import { useAppStore } from '@/stores/appStore'
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
      item.title,
      item.customerName,
      item.customerEmail,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const searchOk = !filters.value.search || haystack.includes(filters.value.search.toLowerCase())
    const statusOk = !filters.value.status || item.status === filters.value.status

    const startDate = normalizeDate(item.startTime)
    const afterStart = !filters.value.startDate || (startDate && startDate >= new Date(filters.value.startDate))
    const beforeEnd = !filters.value.endDate || (startDate && startDate <= new Date(`${filters.value.endDate}T23:59:59`))

    return searchOk && statusOk && afterStart && beforeEnd
  })
})

const metrics = computed(() => {
  const items = sourceItems.value
  return {
    total: items.length,
    pending: items.filter((item) => item.status === 'pending').length,
    confirmed: items.filter((item) => item.status === 'confirmed').length,
    cancelled: items.filter((item) => item.status === 'cancelled').length,
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
      limit: 30,
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
