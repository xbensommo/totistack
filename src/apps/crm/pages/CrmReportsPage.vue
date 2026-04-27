<template>
  <CrmPageShell title="CRM Reports" description="Starter reporting for sales, workload, documents, communications, and workflow coverage.">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <CrmStatCard label="Won deals" :value="snapshot.totals.wonDeals" hint="Closed won opportunities" />
      <CrmStatCard label="Lost deals" :value="snapshot.totals.lostDeals" hint="Closed lost opportunities" />
      <CrmStatCard label="Won value" :value="currency(snapshot.totals.totalWonAmount)" hint="Total closed revenue" />
      <CrmStatCard label="Open tasks" :value="snapshot.totals.openTasks" hint="Pending follow-ups" />
      <CrmStatCard label="Overdue tasks" :value="snapshot.totals.overdueTasks" hint="Attention needed" />
    </div>

    <div class="grid gap-6 xl:grid-cols-3">
      <section class="card"><h2 class="section-title">Documents by type</h2><ul class="mt-4 space-y-3 text-sm text-soft"><li v-for="item in snapshot.documentsByType" :key="item.type" class="status-strip"><span class="capitalize">{{ item.type }}</span><strong class="text-[var(--color-text)]">{{ item.count }}</strong></li></ul></section>
      <section class="card"><h2 class="section-title">Communications by channel</h2><ul class="mt-4 space-y-3 text-sm text-soft"><li v-for="item in snapshot.communicationsByChannel" :key="item.channel" class="status-strip"><span class="capitalize">{{ item.channel }}</span><strong class="text-[var(--color-text)]">{{ item.count }}</strong></li></ul></section>
      <section class="card"><h2 class="section-title">Workflow coverage</h2><dl class="mt-4 grid gap-3 text-sm"><div class="status-strip"><dt class="text-soft">Automation rules</dt><dd class="font-semibold text-[var(--color-text)]">{{ snapshot.totals.automationRules }}</dd></div><div class="status-strip"><dt class="text-soft">Assignment rules</dt><dd class="font-semibold text-[var(--color-text)]">{{ snapshot.totals.assignmentRules }}</dd></div><div class="status-strip"><dt class="text-soft">Documents</dt><dd class="font-semibold text-[var(--color-text)]">{{ snapshot.totals.documents }}</dd></div><div class="status-strip"><dt class="text-soft">Messages</dt><dd class="font-semibold text-[var(--color-text)]">{{ snapshot.totals.messages }}</dd></div></dl></section>
    </div>

    <section class="card p-0 overflow-hidden">
      <div class="px-6 py-5 border-b border-theme"><h2 class="section-title">Owner workload</h2></div>
      <CrmDataTable :columns="columns" :rows="snapshot.ownerWorkload" empty-text="No owner data yet." />
    </section>
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
    wonDeals: 0,
    lostDeals: 0,
    totalWonAmount: 0,
    openTasks: 0,
    overdueTasks: 0,
    documents: 0,
    messages: 0,
    automationRules: 0,
    assignmentRules: 0,
  },
  documentsByType: [],
  communicationsByChannel: [],
  ownerWorkload: [],
});

const columns = [
  { key: 'owner', label: 'Owner' },
  { key: 'count', label: 'Workload count' },
];

function currency(value) {
  return new Intl.NumberFormat('en-NA', {
    style: 'currency',
    currency: 'NAD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

onMounted(async () => {
  const result = await service.fetchReportsSnapshot();
  Object.assign(snapshot, result);
});
</script>
