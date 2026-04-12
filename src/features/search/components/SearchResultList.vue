<template>
  <div class="space-y-4">
    <article v-for="item in results" :key="item.id" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{{ item.resourceType }}</p>
      <h3 class="mt-2 text-lg font-semibold text-slate-900">{{ item.title }}</h3>
      <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.summary }}</p>
      <p class="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Score {{ item._score }}</p>
    </article>
  </div>
</template>

<script setup>
/** @file search/components/SearchResultList.vue */
defineProps({ results: { type: Array, default: () => [] } })
</script>
