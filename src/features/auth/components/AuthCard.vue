<template>
  <section class="card surface-glass relative w-full max-w-xl overflow-hidden rounded-[2rem] p-0">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-brand-gradient opacity-10"></div>
    <div class="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--color-primary)]/10 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-[var(--color-secondary)]/10 blur-3xl"></div>

    <div class="relative p-6 sm:p-8">
      <header class="mb-8">
        <p v-if="eyebrow" class="section-label mb-4">
          {{ eyebrow }}
        </p>

        <div class="space-y-3">
          <h1 class="text-3xl font-bold tracking-[-0.04em] text-[var(--color-text)] md:text-4xl">
            {{ title }}
          </h1>
          <p v-if="description" class="max-w-xl text-sm leading-7 text-muted md:text-base">
            {{ description }}
          </p>
        </div>
      </header>

      <div class="relative">
        <slot />
      </div>
    </div>
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
