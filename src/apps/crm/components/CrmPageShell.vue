<template>
  <section class="page-wrap space-y-8">
    <header class="hero-panel page-header">
      <div class="space-y-3">
        <span v-if="eyebrow" class="section-label">
          {{ eyebrow }}
        </span>

        <div class="space-y-2">
          <h1 class="page-title">
            {{ title }}
          </h1>

          <p v-if="description" class="page-subtitle max-w-3xl">
            {{ description }}
          </p>
        </div>
      </div>

      <div v-if="$slots.actions" class="w-full lg:w-auto">
        <slot name="actions" />
      </div>
    </header>

    <div class="space-y-8">
      <slot />
    </div>
  </section>
</template>

<script setup>
/**
 * Page header component updated for the Totistack design system.
 */
defineProps({
  eyebrow: {
    type: String,
    default: 'Dashboard',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
});
</script>