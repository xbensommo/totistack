<template>
  <section class="min-h-full space-y-6 bg-[var(--color-background,#ffffff)] p-4 text-[var(--color-text-main,#111827)] md:p-6">
    <header class="flex flex-col gap-4 border-b border-[var(--color-border,#e5e7eb)] pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl space-y-2">
        <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent,#2563eb)]">{{ eyebrow }}</p>
        <h1 class="text-3xl font-semibold tracking-tight md:text-4xl">{{ title }}</h1>
        <p v-if="description" class="text-sm leading-6 text-[var(--color-text-muted,#4b5563)] md:text-base">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
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
