<template>
  <EntityPageShell
    eyebrow="Planning"
    title="Booking Calendar"
    description="Starter calendar view for appointment planning, staffing, or room scheduling."
  >
    <template #actions>
      <RouterLink
        to="/bookings"
        class="btn-secondary"
      >
        Back to bookings
      </RouterLink>
    </template>

    <BookingCalendarCard :events="events">
      <template #status="{ event }">
        <StatusBadge :status="event.status || 'pending'" />
      </template>
    </BookingCalendarCard>
  </EntityPageShell>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@app/stores/appStore'
import EntityPageShell from '../components/EntityPageShell.vue'
import BookingCalendarCard from '../components/BookingCalendarCard.vue'
import StatusBadge from '../components/StatusBadge.vue'

const store = useAppStore()

const events = computed(() => {
  const items = store.bookings?.items || store.bookings?.value?.items || store.bookings?.value || store.bookings || []
  return Array.isArray(items) ? items : []
})
</script>
