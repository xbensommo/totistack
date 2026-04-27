<template>
  <section class="rounded-[24px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
    <div class="grid gap-4 lg:grid-cols-[1.8fr,1fr,1fr]">
      <label class="space-y-2">
        <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
          Search
        </span>
        <input
          :value="search"
          type="search"
          placeholder="Search reference, memo, client, consultant..."
          class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] bg-[var(--color-background,#FFFFFF)] px-4 py-3 text-sm text-[var(--color-text,#0F172A)] outline-none transition focus:border-[var(--color-secondary,#4A90E2)] focus:ring-4 focus:ring-[var(--color-secondary,#4A90E2)]/10"
          @input="$emit('update:search', $event.target.value)"
        >
      </label>

      <label class="space-y-2">
        <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
          Status
        </span>
        <select
          :value="status"
          class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] bg-[var(--color-background,#FFFFFF)] px-4 py-3 text-sm text-[var(--color-text,#0F172A)] outline-none transition focus:border-[var(--color-secondary,#4A90E2)] focus:ring-4 focus:ring-[var(--color-secondary,#4A90E2)]/10"
          @change="$emit('update:status', $event.target.value)"
        >
          <option value="all">All statuses</option>
          <option v-for="option in statusOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <label class="space-y-2">
        <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
          Type
        </span>
        <select
          :value="type"
          class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] bg-[var(--color-background,#FFFFFF)] px-4 py-3 text-sm text-[var(--color-text,#0F172A)] outline-none transition focus:border-[var(--color-secondary,#4A90E2)] focus:ring-4 focus:ring-[var(--color-secondary,#4A90E2)]/10"
          @change="$emit('update:type', $event.target.value)"
        >
          <option value="all">All types</option>
          <option v-for="option in typeOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
    </div>
  </section>
</template>

<script setup>
/**
 * @file src/apps/finance/components/FinanceFilterBar.vue
 * @description Filter toolbar for finance lists.
 */

defineProps({
  search: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'all',
  },
  type: {
    type: String,
    default: 'all',
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  typeOptions: {
    type: Array,
    default: () => [],
  },
})

defineEmits([
  'update:search',
  'update:status',
  'update:type',
])
</script>
