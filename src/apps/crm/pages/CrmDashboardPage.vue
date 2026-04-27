<template>
  <CrmPageShell
    title="CRM Dashboard"
    description="Operational view of your lead pipeline, recent CRM activity, contacts, accounts, and follow-up load."
  >
    <div class="kpi-grid">
      <CrmStatCard label="Leads" :value="snapshot.totals.leads" hint="Current leads" />
      <CrmStatCard label="Contacts" :value="snapshot.totals.contacts" hint="People in CRM" />
      <CrmStatCard label="Accounts" :value="snapshot.totals.accounts" hint="Companies" />
      <CrmStatCard label="Opportunities" :value="snapshot.totals.opportunities" hint="Active deals" />
      <CrmStatCard label="Tasks" :value="snapshot.totals.tasks" hint="Open follow-ups" />

      <article class="metric-card">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-3">
            <p class="stat-title">Pipeline</p>
            <p class="stat-value text-primary">{{ currency(snapshot.totals.openPipelineAmount) }}</p>
            <p class="text-sm text-muted">Open pipeline value</p>
          </div>
          <div class="icon-btn text-primary">
            <i class="fa fa-chart-line"></i>
          </div>
        </div>
      </article>
    </div>

    <div class="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
      <section class="card p-0 overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-6 py-5 border-b border-theme">
          <div>
            <h2 class="section-title">Recent leads</h2>
            <p class="mt-1 text-sm text-muted">Latest leads added to your CRM workspace.</p>
          </div>
          <button class="btn-ghost btn-sm" type="button">View all</button>
        </div>

        <CrmDataTable :columns="leadColumns" :rows="snapshot.recentLeads" empty-text="No leads yet." />
      </section>

      <section class="card p-0 overflow-hidden">
        <div class="px-6 py-5 border-b border-theme">
          <h2 class="section-title">Recent activity</h2>
          <p class="mt-1 text-sm text-muted">Notes, calls, follow-ups, and timeline events.</p>
        </div>

        <ul class="divide-y border-theme">
          <li
            v-for="activity in snapshot.recentActivities"
            :key="activity.id"
            class="flex gap-4 px-6 py-5 transition-theme hover:bg-[rgba(109,94,252,0.04)]"
          >
            <div class="mt-1 h-2.5 w-2.5 rounded-full bg-brand-gradient shrink-0"></div>
            <div class="min-w-0">
              <p class="font-semibold text-[var(--color-text)]">{{ activity.subject }}</p>
              <p class="mt-1 text-sm text-muted leading-6">{{ activity.description || 'No description provided.' }}</p>
            </div>
          </li>
          <li v-if="snapshot.recentActivities.length === 0" class="px-6 py-10 text-center text-sm text-muted">
            No CRM activity has been recorded yet.
          </li>
        </ul>
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
  totals: { leads: 0, contacts: 0, accounts: 0, opportunities: 0, tasks: 0, openPipelineAmount: 0 },
  recentLeads: [],
  recentActivities: [],
});

const leadColumns = [
  { key: 'fullName', label: 'Lead' },
  { key: 'company', label: 'Company' },
  { key: 'status', label: 'Status' },
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