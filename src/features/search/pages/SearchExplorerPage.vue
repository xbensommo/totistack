<template>
  <section class="mx-auto max-w-5xl space-y-6 px-4 py-10">
    <header class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Search</p>
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Project search</h1>
      <p class="text-sm leading-6 text-slate-600">Starter public search experience driven by the feature search service.</p>
    </header>
    <div class="grid gap-6 lg:grid-cols-[1fr,320px]">
      <div class="space-y-6">
        <SearchConsole v-model="query" @search="runSearch" />
        <SearchResultList :results="results" />
      </div>
      <FacetPanel />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import SearchConsole from '../components/SearchConsole.vue'
import SearchResultList from '../components/SearchResultList.vue'
import FacetPanel from '../components/FacetPanel.vue'
import { createSearchService } from '../services/searchService.js'

const searchService = createSearchService()
const query = ref('')
const results = ref([])

async function runSearch(value) {
  const response = await searchService.search(value, { source: 'public-search' })
  results.value = response.results
}
</script>
