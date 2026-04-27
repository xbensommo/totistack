<template>
  <section class="page-wrap space-y-8">
    <header class="page-header hero-panel">
      <div class="space-y-3">
        <p v-if="eyebrow" class="section-label">
          {{ eyebrow }}
        </p>
        <h1 class="page-title">
          {{ title }}
        </h1>
        <p v-if="description" class="page-subtitle">
          {{ description }}
        </p>
      </div>

      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </header>

    <div class="space-y-6">
      <slot />
    </div>
  </section>
</template>

<script setup>
/**
 * @file apps/dashboard/components/DashboardPageShell.vue
 * @description Generic dashboard page shell used by all starter dashboard screens.
 */

defineProps({
  eyebrow: {
    type: String,
    default: 'Overview',
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
