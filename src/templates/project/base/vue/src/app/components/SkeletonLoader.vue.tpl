<template>
  <div v-if="loading" class="space-y-4">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse h-12 rounded-xl bg-[var(--color-neutral)]"
    />
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  count: { type: Number, default: 3 }
})
</script>
