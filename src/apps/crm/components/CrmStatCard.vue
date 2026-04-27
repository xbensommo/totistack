<template>
  <article class="metric-card">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-3">
        <p class="stat-title">
          {{ label }}
        </p>

        <p class="stat-value">
          {{ value }}
        </p>

        <p v-if="hint" class="text-sm text-muted">
          {{ hint }}
        </p>
      </div>

      <div v-if="$slots.icon" class="icon-btn text-muted">
        <slot name="icon" />
      </div>
    </div>
  </article>
</template>

<script setup>
/**
 * Generic KPI card with optional icon slot.
 */
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
});
</script>