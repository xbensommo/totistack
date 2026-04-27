<template>
  <section class="page-wrap space-y-6">
    <header class="hero-panel page-header">
      <div class="space-y-3">
        <p v-if="eyebrow" class="section-label">
          {{ eyebrow }}
        </p>
        <div class="space-y-2">
          <h1 class="page-title">
            {{ title }}
          </h1>
          <p v-if="description" class="page-subtitle">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </header>

    <div v-if="$slots.filters" class="card p-4 md:p-5">
      <slot name="filters" />
    </div>

    <slot />
  </section>
</template>

<script setup>
/**
 * @file EntityPageShell.vue
 * @description Generic page shell for starter back-office modules.
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
