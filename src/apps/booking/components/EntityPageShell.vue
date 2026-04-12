<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-2">
        <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {{ eyebrow }}
        </p>
        <div class="space-y-2">
          <h1 class="text-2xl font-semibold tracking-tight text-slate-950">
            {{ title }}
          </h1>
          <p v-if="description" class="max-w-3xl text-sm leading-6 text-slate-600">
            {{ description }}
          </p>
        </div>
      </div>

      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </header>

    <div v-if="$slots.metrics" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <slot name="metrics" />
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
