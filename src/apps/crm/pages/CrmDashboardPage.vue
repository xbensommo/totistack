<template>
  <CrmPageShell
    title="CRM Dashboard"
    description="Operational view of your lead pipeline, recent CRM activity, and sales opportunities."
  >
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <CrmStatCard label="Leads" :value="snapshot.totals.leads" hint="Current lead records" />
      <CrmStatCard label="Opportunities" :value="snapshot.totals.opportunities" hint="Tracked deal opportunities" />
      <CrmStatCard label="Activities" :value="snapshot.totals.activities" hint="Logged CRM interactions" />
      <CrmStatCard label="Open pipeline" :value="currency(snapshot.totals.openPipelineAmount)" hint="Weighted active pipeline" />
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-slate-900">Recent leads</h2>
        <CrmDataTable :columns="leadColumns" :rows="snapshot.recentLeads" empty-text="No leads yet." />
      </section>

      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-slate-900">Recent activity</h2>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ul class="space-y-4">
            <li
              v-for="activity in snapshot.recentActivities"
              :key="activity.id"
              class="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
            >
              <p class="font-medium text-slate-900">{{ activity.subject }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ activity.description || 'No description provided.' }}</p>
            </li>
            <li v-if="snapshot.recentActivities.length === 0" class="text-sm text-slate-500">
              No CRM activity has been recorded yet.
            </li>
          </ul>
        </div>
      </section>
    </div>
  </CrmPageShell>
</template>

<script setup>
import { onMounted, reactive } from 'vue';
import CrmDataTable from '../components/CrmDataTable.vue';
import CrmPageShell from '../components/CrmPageShell.vue';
import CrmStatCard from '../components/CrmStatCard.vue';
import { useCrmService } from '../services/crmService.js';

const { service } = useCrmService();

const snapshot = reactive({
  totals: {
    leads: 0,
    opportunities: 0,
    activities: 0,
    openPipelineAmount: 0,
  },
  recentLeads: [],
  recentActivities: [],
});

const leadColumns = [
  { key: 'fullName', label: 'Lead' },
  { key: 'company', label: 'Company' },
  { key: 'status', label: 'Status' },
  { key: 'source', label: 'Source' },
];

function currency(value) {
  return new Intl.NumberFormat('en-NA', {
    style: 'currency',
    currency: 'NAD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

onMounted(async () => {
  const result = await service.fetchDashboardSnapshot();
  Object.assign(snapshot, result);
});
</script>
