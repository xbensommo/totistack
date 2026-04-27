<template>
  <section class="card overflow-hidden p-0">
    <header class="flex items-center justify-between gap-3 border-b border-theme px-5 py-4 md:px-6">
      <div>
        <h2 class="section-title text-base md:text-lg">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-1 text-sm text-muted">
          {{ description }}
        </p>
      </div>
      <slot name="header-actions" />
    </header>

    <div class="p-5 md:p-6">
      <slot />
    </div>
  </section>
</template>

<script setup>
/**
 * @file EntitySectionCard.vue
 * @description Generic card wrapper for extendable detail sections.
 */

defineProps({
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
