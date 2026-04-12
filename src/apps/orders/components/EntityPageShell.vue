<template>
  <section class="space-y-6">
    <div class="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-sm">
      <div class="flex flex-col gap-6 px-6 py-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div class="max-w-3xl space-y-3">
          <p v-if="eyebrow" class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            {{ eyebrow }}
          </p>
          <div class="space-y-2">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              {{ title }}
            </h1>
            <p v-if="description" class="text-sm leading-6 text-slate-600 md:text-[15px]">
              {{ description }}
            </p>
          </div>
        </div>

        <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.metrics" class="grid gap-4 border-t border-slate-200/80 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 lg:px-8">
        <slot name="metrics" />
      </div>
    </div>

    <div class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <slot />
    </div>
  </section>
</template>

<script setup>
/**
 * Generic page shell for operational Totistack apps.
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
