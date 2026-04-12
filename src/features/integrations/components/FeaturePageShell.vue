<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-2">
        <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{{ eyebrow }}</p>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">{{ title }}</h1>
        <p v-if="description" class="max-w-3xl text-sm leading-6 text-slate-600">{{ description }}</p>
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
