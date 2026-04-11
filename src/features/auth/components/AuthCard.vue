<template>
  <section class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <header class="mb-6">
      <p v-if="eyebrow" class="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        {{ eyebrow }}
      </p>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-2 text-sm leading-6 text-slate-600">
        {{ description }}
      </p>
    </header>

    <slot />
  </section>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: 'Access',
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
