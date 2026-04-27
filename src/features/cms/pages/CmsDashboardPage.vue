<template>
  <CmsPageShell title="CMS dashboard" description="Publishing health, draft workload, and redirect control.">
    <template #actions>
      <button type="button" class="border border-[var(--color-border,#e5e7eb)] px-4 py-2 text-sm font-medium" @click="reload">Refresh</button>
    </template>

    <div class="grid gap-3 md:grid-cols-3">
      <article v-for="metric in metrics" :key="metric.label" class="border border-[var(--color-border,#e5e7eb)] bg-[var(--color-surface,#f8fafc)] p-4">
        <p class="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted,#64748b)]">{{ metric.label }}</p>
        <p class="mt-2 text-2xl font-semibold">{{ metric.value }}</p>
      </article>
    </div>

    <section class="border border-[var(--color-border,#e5e7eb)] bg-[var(--color-background,#ffffff)]">
      <div class="flex flex-col gap-3 border-b border-[var(--color-border,#e5e7eb)] p-4 md:flex-row md:items-center md:justify-between">
        <input v-model="search" type="search" placeholder="Search" class="w-full border border-[var(--color-border,#e5e7eb)] bg-transparent px-3 py-2 text-sm md:max-w-sm" />
        <p class="text-sm text-[var(--color-text-muted,#64748b)]">{{ loading ? 'Loading...' : `${filteredItems.length} visible records` }}</p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-[var(--color-surface,#f8fafc)] text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted,#64748b)]">
            <tr><th v-for="column in columns" :key="column.key" class="px-4 py-3 font-medium">{{ column.label }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id" class="border-t border-[var(--color-border,#e5e7eb)]">
              <td v-for="column in columns" :key="column.key" class="px-4 py-3 align-top">{{ formatCell(item, column.key) }}</td>
            </tr>
            <tr v-if="!filteredItems.length"><td :colspan="columns.length" class="px-4 py-10 text-center text-[var(--color-text-muted,#64748b)]">No records found.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </CmsPageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '@app/stores/appStore'
import CmsPageShell from '../components/CmsPageShell.vue'
import { fetchPage, getCollectionItems, normalizeDate } from '../services/cmsStoreAccess.js'

const store = useAppStore()
const collectionName = 'cmsPages'
const columns = [{ key: 'title', label: 'Page' }, { key: 'path', label: 'Path' }, { key: 'status', label: 'Status' }, { key: 'updatedAt', label: 'Updated' }]
const search = ref('')
const loading = ref(false)
const items = computed(() => getCollectionItems(store, collectionName))
const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter((item) => JSON.stringify(item).toLowerCase().includes(q))
})
const metrics = computed(() => [{ label: 'Pages', value: items.value.length }, { label: 'Published', value: items.value.filter((i) => i.status === 'published').length }, { label: 'Drafts', value: items.value.filter((i) => i.status === 'draft').length }])

onMounted(reload)

async function reload() {
  loading.value = true
  try {
    await fetchPage(store, collectionName, { limit: 30, orderBy: 'updatedAt', orderDirection: 'desc', filters: [{ field: 'isDeleted', op: '==', value: false }] })
  } finally {
    loading.value = false
  }
}

function formatCell(item, key) {
  const value = key.split('.').reduce((acc, part) => acc?.[part], item)
  const date = key.endsWith('At') ? normalizeDate(value) : null
  if (date) return date.toLocaleDateString()
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`
  if (value && typeof value === 'object') return '—'
  return value ?? '—'
}
</script>
