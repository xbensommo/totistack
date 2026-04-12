<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">{{ title }}</h2>
        <p class="mt-1 text-sm text-slate-600">
          {{ description }}
        </p>
      </div>
      <div class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
        Starter
      </div>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="event in events"
        :key="event.id || event.bookingNumber"
        class="rounded-xl border border-slate-200 p-4"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {{ formatDay(event.startTime) }}
        </p>
        <h3 class="mt-2 text-sm font-semibold text-slate-950">
          {{ event.title || event.bookingNumber || 'Booking' }}
        </h3>
        <p class="mt-1 text-sm text-slate-600">
          {{ formatTimeRange(event.startTime, event.endTime) }}
        </p>
        <div class="mt-3">
          <slot name="status" :event="event" />
        </div>
      </article>

      <article
        v-if="!events.length"
        class="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 sm:col-span-2 xl:col-span-4"
      >
        No booking events found for this period.
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
