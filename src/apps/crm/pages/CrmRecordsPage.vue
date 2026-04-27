<template>
  <CrmPageShell title="Customer Records and History" description="Unified view across leads, contacts, accounts, opportunities, and their timeline events.">
    <div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section class="space-y-4">
        <h2 class="section-title">Record counts</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <article class="metric-card p-5"><p class="stat-title">Leads</p><p class="stat-value text-3xl">{{ snapshot.leads.length }}</p></article>
          <article class="metric-card p-5"><p class="stat-title">Contacts</p><p class="stat-value text-3xl">{{ snapshot.contacts.length }}</p></article>
          <article class="metric-card p-5"><p class="stat-title">Accounts</p><p class="stat-value text-3xl">{{ snapshot.accounts.length }}</p></article>
          <article class="metric-card p-5"><p class="stat-title">Opportunities</p><p class="stat-value text-3xl">{{ snapshot.opportunities.length }}</p></article>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="section-title">Recent customer history</h2>
        <div class="card">
          <ul class="space-y-4">
            <li v-for="event in snapshot.timeline" :key="event.id" class="list-row items-start">
              <div>
                <div class="flex flex-wrap items-center gap-2"><p class="font-medium text-[var(--color-text)]">{{ event.title }}</p><span class="badge">{{ event.entity }}</span></div>
                <p class="mt-2 text-sm text-muted">{{ event.description || 'No extra description.' }}</p>
              </div>
            </li>
            <li v-if="snapshot.timeline.length === 0" class="empty-state"><p class="text-sm text-muted">No customer history found yet.</p></li>
          </ul>
        </div>
      </section>
    </div>
  </CrmPageShell>
</template>

<script setup>
import { onMounted, reactive } from 'vue';
import CrmPageShell from '../components/CrmPageShell.vue';
import { useCrmService } from '../services/crmService.js';

const { service } = useCrmService();
const snapshot = reactive({
  leads: [],
  contacts: [],
  accounts: [],
  opportunities: [],
  timeline: [],
});

onMounted(async () => {
  const result = await service.fetchCustomerRecordsSnapshot();
  Object.assign(snapshot, result);
});
</script>
