<template>
  <CrmPageShell title="Search and Saved Views" description="Quickly search across CRM records and save filter presets for later reuse.">
    <template #actions>
      <div class="flex w-full flex-col gap-4 lg:w-auto xl:flex-row">
        <div class="card-soft w-full lg:min-w-[420px]">
          <form class="grid gap-4 md:grid-cols-[1fr_auto] md:items-end" @submit.prevent="runSearch">
            <label class="grid gap-2"><span class="field-label mb-0">Search query</span><input v-model="query" class="input-field" placeholder="Search leads, contacts, accounts..." /></label>
            <button class="btn-primary" type="submit">Search</button>
          </form>
        </div>
        <div class="card-soft w-full lg:min-w-[360px]">
          <form class="grid gap-4 md:grid-cols-[1fr_auto] md:items-end" @submit.prevent="saveView">
            <label class="grid gap-2"><span class="field-label mb-0">Save current search as</span><input v-model="viewName" class="input-field" placeholder="My saved view" /></label>
            <button class="btn-secondary" type="submit">Save view</button>
          </form>
        </div>
      </div>
    </template>

    <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section class="card p-0 overflow-hidden"><div class="px-6 py-5 border-b border-theme"><h2 class="section-title">Search results</h2></div><CrmDataTable :columns="columns" :rows="rows" empty-text="Run a search to see matching CRM records." /></section>
      <section class="card p-0 overflow-hidden"><div class="px-6 py-5 border-b border-theme"><h2 class="section-title">Saved views</h2></div><CrmDataTable :columns="viewColumns" :rows="savedViews" empty-text="No saved views yet." /></section>
    </div>
  </CrmPageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import CrmDataTable from '../components/CrmDataTable.vue';
import CrmPageShell from '../components/CrmPageShell.vue';
import { useCrmService } from '../services/crmService.js';

const { service } = useCrmService();
const query = ref('');
const viewName = ref('');
const rows = ref([]);
const savedViews = ref([]);

const columns = [
  { key: 'module', label: 'Module' },
  { key: 'title', label: 'Title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'status', label: 'Status' },
];

const viewColumns = [
  { key: 'name', label: 'Name' },
  { key: 'module', label: 'Module' },
  { key: 'query', label: 'Query' },
  { key: 'visibility', label: 'Visibility' },
];

async function loadSavedViews() {
  savedViews.value = await service.fetchSavedViews();
}

async function runSearch() {
  rows.value = await service.searchEverything(query.value);
}

async function saveView() {
  if (!viewName.value.trim()) return;
  await service.createSavedView({
    name: viewName.value.trim(),
    module: 'global-search',
    query: query.value.trim(),
    filters: {},
  });
  viewName.value = '';
  await loadSavedViews();
}

onMounted(loadSavedViews);
</script>
