<template>
  <div class="card overflow-hidden">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-2">
        <p class="section-label">Schedule View</p>
        <div>
          <h2 class="section-title">{{ title }}</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="chip self-start">
        Starter
      </div>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="event in events"
        :key="event.id || event.bookingNumber"
        class="card-soft rounded-[1.25rem] transition-theme hover:-translate-y-1 hover:shadow-theme-sm"
      >
        <p class="text-caption">
          {{ formatDay(event.startTime) }}
        </p>
        <h3 class="mt-3 text-base font-semibold text-[var(--color-text)]">
          {{ event.title || event.bookingNumber || 'Booking' }}
        </h3>
        <p class="mt-2 text-sm text-soft">
          {{ formatTimeRange(event.startTime, event.endTime) }}
        </p>
        <div class="mt-4">
          <slot name="status" :event="event" />
        </div>
      </article>

      <article
        v-if="!events.length"
        class="empty-state sm:col-span-2 xl:col-span-4"
      >
        <h3 class="text-lg font-semibold text-[var(--color-text)]">No booking events yet</h3>
        <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
          No booking events were found for this period.
        </p>
      </article>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Booking Calendar',
  },
  description: {
    type: String,
    default: 'Use this starter card to plug in FullCalendar or your custom resource scheduler.',
  },
  events: {
    type: Array,
    default: () => [],
  },
})

function formatDay(value) {
  const date = normalizeDate(value)
  return date
    ? new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(date)
    : 'Unknown day'
}

function formatTimeRange(start, end) {
  const startDate = normalizeDate(start)
  const endDate = normalizeDate(end)

  if (!startDate || !endDate) return '—'

  const formatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' })
  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`
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
