<template>
  <PortalPageShell
    eyebrow="Portal Admin"
    title="Portal memberships"
    description="Memberships are the real access boundary. If these are wrong, the whole portal leaks."
  >
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-base font-semibold text-slate-950">All memberships</h2>
        <button type="button" class="text-sm font-medium text-slate-600 hover:text-slate-950" @click="loadAdminMemberships">
          Reload
        </button>
      </div>
      <div v-if="adminMemberships.length" class="mt-4 overflow-hidden rounded-2xl border border-slate-100">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-4 py-3 font-medium">Portal account</th>
              <th class="px-4 py-3 font-medium">Role</th>
              <th class="px-4 py-3 font-medium">Linked record</th>
              <th class="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="membership in adminMemberships" :key="membership.id || membership.portalAccountId || membership.externalUserId">
              <td class="px-4 py-3 text-slate-950">{{ membership.portalAccountId || membership.externalUserId }}</td>
              <td class="px-4 py-3 text-slate-600">{{ membership.membershipRole }}</td>
              <td class="px-4 py-3 text-slate-600">{{ membership.linkedRecordType || 'record' }} · {{ membership.linkedRecordId || 'n/a' }}</td>
              <td class="px-4 py-3 text-slate-600">{{ membership.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PortalEmptyState
        v-else
        title="No memberships available"
        description="Use portal invites and membership grants to make external access explicit and auditable."
      />
    </section>
  </PortalPageShell>
</template>

<script setup>
import { onMounted } from 'vue'
import PortalEmptyState from '../components/PortalEmptyState.vue'
import PortalPageShell from '../components/PortalPageShell.vue'
import { usePortal } from '../composables/usePortal.js'

const { adminMemberships, loadAdminMemberships } = usePortal()

onMounted(() => {
  loadAdminMemberships().catch(() => {})
})
</script>
