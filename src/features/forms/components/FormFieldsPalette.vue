<template>
  <aside class="card h-fit">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="section-label">Builder tools</p>
        <h3 class="mt-3 section-title">Field library</h3>
        <p class="mt-1 text-sm text-muted">Add reusable input types to your form canvas.</p>
      </div>
      <span class="badge">{{ fields.length }}</span>
    </div>

    <div class="mt-5 grid gap-3">
      <button
        v-for="field in fields"
        :key="field.type"
        type="button"
        class="option-card text-left"
        @click="$emit('add', field)"
      >
        <span
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(109,94,252,0.08)] text-primary"
        >
          <i class="fas fa-plus text-sm"></i>
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold text-[var(--color-text)]">{{ field.label }}</span>
          <span class="mt-1 block text-xs uppercase tracking-[0.18em] text-muted">{{ field.type }}</span>
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup>
/**
 * @file forms/components/FormFieldsPalette.vue
 * @description Starter field palette for the form builder experience.
 */
defineProps({
  fields: { type: Array, default: () => [] },
})
defineEmits(['add'])
</script>
