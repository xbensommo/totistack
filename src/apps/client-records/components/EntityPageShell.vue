<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
      <div class="space-y-2">
        <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          {{ eyebrow }}
        </p>
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold text-slate-900 md:text-3xl">
            {{ title }}
          </h1>
          <p v-if="description" class="max-w-3xl text-sm leading-6 text-slate-600">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </header>

    <div v-if="$slots.filters" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
