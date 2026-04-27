<template>
  <section class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <header class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          {{ eyebrow }}
        </p>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-950">
          {{ title }}
        </h1>
        <p v-if="description" class="mt-2 max-w-3xl text-sm text-slate-600">
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
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
