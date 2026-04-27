<template>
  <PortalPageShell
    eyebrow="Portal"
    title="My workspace"
    description="The portal should show only the records that the external user is genuinely allowed to see."
  >
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-base font-semibold text-slate-950">Linked records</h2>
        <button type="button" class="text-sm font-medium text-slate-600 hover:text-slate-950" @click="refreshWorkspace">
          Refresh
        </button>
      </div>
      <div v-if="workspace?.records?.length" class="mt-4 overflow-hidden rounded-2xl border border-slate-100">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-4 py-3 font-medium">Title</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="item in workspace.records" :key="item.id || item.sourceId || item.recordId">
              <td class="px-4 py-3 text-slate-950">{{ item.title || item.name || item.subject || 'Untitled record' }}</td>
              <td class="px-4 py-3 text-slate-600">{{ item.status || item.stage || 'open' }}</td>
              <td class="px-4 py-3 text-slate-600">{{ item.type || item.entityType || 'record' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PortalEmptyState
        v-else
        title="No linked records"
        description="Link orders, students, clients, or projects through portal memberships to make this page useful."
      />
    </section>
  </PortalPageShell>
</template>

<script setup>
import { onMounted } from 'vue'
import PortalEmptyState from '../components/PortalEmptyState.vue'
import PortalPageShell from '../components/PortalPageShell.vue'
import { usePortal } from '../composables/usePortal.js'

const { bootstrap, refreshWorkspace, workspace } = usePortal()

onMounted(() => {
  bootstrap().catch(() => {})
})
</script>
