<template>
  <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 class="text-base font-semibold text-slate-900">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-1 text-sm text-slate-500">
          {{ description }}
        </p>
      </div>
      <slot name="header-actions" />
    </header>

    <div class="p-5">
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
