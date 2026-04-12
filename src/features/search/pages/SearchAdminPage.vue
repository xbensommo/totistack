<template>
  <FeaturePageShell eyebrow="Search" title="Search administration" description="Manage indexed content and synonyms so search behaves consistently across the project.">
    <div class="grid gap-6 xl:grid-cols-[1fr,360px]">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">Indexed resources</h3>
        <ul class="mt-4 space-y-3 text-sm text-slate-600">
          <li v-for="item in indexes" :key="item.id">{{ item.title }} · {{ item.resourceType }}</li>
        </ul>
      </div>
      <FacetPanel />
    </div>
  </FeaturePageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import FacetPanel from '../components/FacetPanel.vue'
import { createSearchService } from '../services/searchService.js'

const searchService = createSearchService()
const indexes = ref([])

onMounted(async () => {
  indexes.value = await searchService.listIndexes()
})
</script>
