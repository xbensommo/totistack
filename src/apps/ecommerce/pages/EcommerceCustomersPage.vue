<template>
  <CommercePageShell eyebrow="Commerce" title="Customers" description="Customer records independent from auth accounts.">
    <template #actions>
      <button type="button" class="border border-[var(--color-border,#e5e7eb)] px-4 py-2 text-sm font-medium" @click="reload">Refresh</button>
    </template>

    <CommerceMetricGrid :metrics="metrics" />

    <section class="border border-[var(--color-border,#e5e7eb)] bg-[var(--color-background,#ffffff)]">
      <div class="flex flex-col gap-3 border-b border-[var(--color-border,#e5e7eb)] p-4 md:flex-row md:items-center md:justify-between">
        <input v-model="search" type="search" placeholder="Search" class="w-full border border-[var(--color-border,#e5e7eb)] bg-transparent px-3 py-2 text-sm md:max-w-sm" />
        <p class="text-sm text-[var(--color-text-muted,#64748b)]">{{ loading ? 'Loading...' : `${filteredItems.length} visible records` }}</p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-[var(--color-surface,#f8fafc)] text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted,#64748b)]">
            <tr>
              <th v-for="column in columns" :key="column.key" class="px-4 py-3 font-medium">{{ column.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id" class="border-t border-[var(--color-border,#e5e7eb)]">
              <td v-for="column in columns" :key="column.key" class="px-4 py-3 align-top">{{ formatCell(item, column.key) }}</td>
            </tr>
            <tr v-if="!filteredItems.length">
              <td :colspan="columns.length" class="px-4 py-10 text-center text-[var(--color-text-muted,#64748b)]">No records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </CommercePageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '@app/stores/appStore'
import CommerceMetricGrid from '../components/CommerceMetricGrid.vue'
import CommercePageShell from '../components/CommercePageShell.vue'
import { fetchPage, getCollectionItems, normalizeDate, normalizeMoney } from '../services/commerceStoreAccess.js'

const store = useAppStore()
const search = ref('')
const loading = ref(false)
const collectionName = 'commerceCustomers'
const columns = [{ key: 'displayName', label: 'Customer' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'status', label: 'Status' }, { key: 'lifetimeValue', label: 'Lifetime value' }]

const items = computed(() => getCollectionItems(store, collectionName))
const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter((item) => JSON.stringify(item).toLowerCase().includes(q))
})
const metrics = computed(() => [{ label: 'Customers', value: items.value.length }, { label: 'Active', value: items.value.filter((i) => i.status === 'active').length }, { label: 'Orders tracked', value: items.value.reduce((sum, i) => sum + Number(i.totalOrders || 0), 0) }, { label: 'Value tracked', value: normalizeMoney(items.value.reduce((sum, i) => sum + Number(i.lifetimeValue || 0), 0), 'NAD') }])

onMounted(reload)

async function reload() {
  loading.value = true
  try {
    await fetchPage(store, collectionName, {
      limit: 30,
      orderBy: 'createdAt',
      orderDirection: 'desc',
      filters: [{ field: 'isDeleted', op: '==', value: false }],
    })
  } finally {
    loading.value = false
  }
}

function formatCell(item, key) {
  const value = key.split('.').reduce((acc, part) => acc?.[part], item)
  if (key.toLowerCase().includes('price') || key.toLowerCase().includes('total') || key.toLowerCase().includes('amount')) return normalizeMoney(value, item.currency || 'NAD')
  const date = key.endsWith('At') ? normalizeDate(value) : null
  if (date) return date.toLocaleDateString()
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`
  if (value && typeof value === 'object') return '—'
  return value ?? '—'
}
</script>
