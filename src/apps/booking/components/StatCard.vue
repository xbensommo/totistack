<template>
  <article class="metric-card">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="stat-title">{{ label }}</p>
        <p class="stat-value">{{ value }}</p>
      </div>

      <div
        v-if="icon"
        class="inline-flex min-h-[2.5rem] items-center rounded-full bg-[rgba(109,94,252,0.08)] px-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
      >
        {{ icon }}
      </div>
    </div>

    <p v-if="hint" class="mt-4 text-sm leading-6 text-muted">
      {{ hint }}
    </p>
  </article>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  hint: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
})
</script>
