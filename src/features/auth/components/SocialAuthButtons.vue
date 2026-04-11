<template>
  <div v-if="providers.length > 0" class="space-y-3">
    <button
      v-for="provider in providers"
      :key="provider.id"
      type="button"
      class="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="loading"
      @click="$emit('select', provider.id)"
    >
      <span>{{ provider.label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  providers: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['select']);
</script>
