<template>
  <section class="space-y-6">
    <header class="hero-panel page-header">
      <div class="space-y-3">
        <p v-if="eyebrow" class="section-label">{{ eyebrow }}</p>
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="description" class="page-subtitle">{{ description }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>

<script setup>
/**
 * @file components/FeaturePageShell.vue
 * @description Generic page shell used by starter feature pages.
 */
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
