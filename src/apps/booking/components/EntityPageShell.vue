<template>
  <section class="space-y-6">
    <header class="hero-panel">
      <div class="page-header mb-0">
        <div class="space-y-4">
          <p v-if="eyebrow" class="section-label">
            {{ eyebrow }}
          </p>

          <div class="space-y-3">
            <h1 class="page-title">
              {{ title }}
            </h1>
            <p v-if="description" class="page-subtitle">
              {{ description }}
            </p>
          </div>
        </div>

        <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.metrics" class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <slot name="metrics" />
      </div>
    </header>

    <div class="card">
      <slot />
    </div>
  </section>
</template>

<script setup>
/**
 * Generic page shell for CRUD-style Totistack apps.
 */
defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
