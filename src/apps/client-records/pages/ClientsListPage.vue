<template>
  <EntityPageShell
    eyebrow="Client Records"
    title="Clients"
    description="Manage client master records, track status, and use the starter UI as a foundation for richer workflows."
  >
    <template #actions>
      <RouterLink
        to="/clients/new"
        class="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        New Client
      </RouterLink>
    </template>

    <template #filters>
      <div class="grid gap-3 md:grid-cols-3">
        <label class="space-y-2 text-sm text-slate-600">
          <span>Search</span>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Name, email, or client number"
            class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0 transition focus:border-slate-900"
          />
        </label>
        <label class="space-y-2 text-sm text-slate-600">
          <span>Status</span>
          <select v-model="filters.status" class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900">
            <option value="">All statuses</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label class="space-y-2 text-sm text-slate-600">
          <span>Lifecycle</span>
          <select v-model="filters.lifecycleStage" class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900">
            <option value="">All stages</option>
            <option value="lead">Lead</option>
            <option value="opportunity">Opportunity</option>
            <option value="customer">Customer</option>
            <option value="advocate">Advocate</option>
          </select>
        </label>
      </div>
    </template>

    <EntityStatsGrid :items="stats" />

    <EntityTable :columns="columns" :rows="filteredRows" empty-text="No clients yet.">
      <template #cell:name="{ row }">
        <div class="space-y-1">
          <RouterLink :to="`/clients/${row.id}`" class="font-medium text-slate-900 hover:underline">
            {{ displayName(row) }}
          </RouterLink>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-400">
            {{ row.clientNumber || 'No number' }}
          </p>
        </div>
      </template>

      <template #cell:status="{ value }">
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {{ value || 'unknown' }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <RouterLink :to="`/clients/${row.id}`" class="text-sm font-medium text-slate-700 hover:text-slate-900">
            View
          </RouterLink>
          <RouterLink :to="`/clients/${row.id}/edit`" class="text-sm font-medium text-slate-700 hover:text-slate-900">
            Edit
          </RouterLink>
        </div>
      </template>
    </EntityTable>
  </EntityPageShell>
</template>

<script setup>
/**
 * @file ClientsListPage.vue
 * @description Starter listing page for client records.
 */

import { computed, onMounted, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import EntityPageShell from '../components/EntityPageShell.vue'
import EntityStatsGrid from '../components/EntityStatsGrid.vue'
import EntityTable from '../components/EntityTable.vue'
import { createClientService } from '../services/clientService.js'

const store = useAppStore()
const clientService = createClientService({ store })

const filters = reactive({
  search: '',
  status: '',
  lifecycleStage: '',
})

const columns = [
  { key: 'name', label: 'Client' },
  { key: 'status', label: 'Status' },
  { key: 'lifecycleStage', label: 'Lifecycle' },
  { key: 'email', label: 'Email' },
  { key: 'assignedTo', label: 'Owner' },
]

const rows = computed(() => store.clients?.items || [])

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    const haystack = `${row.clientNumber || ''} ${row.companyName || ''} ${row.firstName || ''} ${row.lastName || ''} ${row.email || ''}`.toLowerCase()
    const matchesSearch = !filters.search || haystack.includes(filters.search.toLowerCase())
    const matchesStatus = !filters.status || row.status === filters.status
    const matchesLifecycle = !filters.lifecycleStage || row.lifecycleStage === filters.lifecycleStage
    return matchesSearch && matchesStatus && matchesLifecycle
  })
})

const stats = computed(() => {
  const items = rows.value
  return [
    { label: 'Total Clients', value: items.length },
    { label: 'Active', value: items.filter((item) => item.status === 'active').length },
    { label: 'Leads', value: items.filter((item) => item.lifecycleStage === 'lead').length },
    { label: 'Customers', value: items.filter((item) => item.lifecycleStage === 'customer').length },
  ]
})

/**
 * Get a human-friendly client name.
 *
 * @param {object} row
 * @returns {string}
 */
function displayName(row) {
  return row.companyName || [row.firstName, row.lastName].filter(Boolean).join(' ') || 'Unnamed client'
}

onMounted(async () => {
  await clientService.fetchClients()
})
</script>
