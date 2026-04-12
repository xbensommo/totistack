<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div class="space-y-2">
        <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          {{ eyebrow }}
        </p>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
          {{ title }}
        </h1>
        <p v-if="description" class="max-w-3xl text-sm leading-6 text-slate-600">
          {{ description }}
        </p>
      </div>

      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </header>

    <slot />
  </section>
</template>

<script setup>
/**
 * Generic page shell for CRM starter pages.
 */
defineProps({
  eyebrow: {
    type: String,
    default: 'CRM',
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
