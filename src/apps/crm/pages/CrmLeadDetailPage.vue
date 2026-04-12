<template>
  <CrmPageShell title="Lead detail" description="Review lead context and convert it into an opportunity when ready.">
    <div class="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div v-if="lead" class="space-y-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Lead</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">{{ lead.fullName || [lead.firstName, lead.lastName].filter(Boolean).join(' ') }}</h2>
          </div>
          <dl class="grid gap-3 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium text-slate-500">Company</dt>
              <dd class="text-sm text-slate-800">{{ lead.company || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-slate-500">Email</dt>
              <dd class="text-sm text-slate-800">{{ lead.email || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-slate-500">Status</dt>
              <dd class="text-sm text-slate-800">{{ lead.status || 'new' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-slate-500">Source</dt>
              <dd class="text-sm text-slate-800">{{ lead.source || 'manual' }}</dd>
            </div>
          </dl>
          <p class="text-sm leading-6 text-slate-600">{{ lead.notes || 'No notes recorded for this lead.' }}</p>
        </div>
        <p v-else class="text-sm text-slate-500">Lead not found.</p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">Convert to opportunity</h3>
        <form class="mt-4 grid gap-3" @submit.prevent="convertLead">
          <label class="grid gap-1">
            <span class="text-xs font-medium text-slate-600">Opportunity name</span>
            <input v-model="convertForm.name" class="rounded-xl border border-slate-300 px-3 py-2" required />
          </label>
          <label class="grid gap-1">
            <span class="text-xs font-medium text-slate-600">Amount</span>
            <input v-model.number="convertForm.amount" class="rounded-xl border border-slate-300 px-3 py-2" min="0" type="number" />
          </label>
          <button class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
            Convert lead
          </button>
        </form>
      </section>
    </div>
  </CrmPageShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import CrmPageShell from '../components/CrmPageShell.vue';
import { useCrmService } from '../services/crmService.js';

const route = useRoute();
const { service } = useCrmService();
const lead = ref(null);
const convertForm = reactive({
  name: '',
  amount: 0,
});

async function loadLead() {
  lead.value = await service.fetchLeadById(route.params.id);
  if (lead.value && !convertForm.name) {
    convertForm.name = `${lead.value.company || lead.value.fullName || 'Lead'} Opportunity`;
  }
}

async function convertLead() {
  await service.convertLeadToOpportunity(route.params.id, { ...convertForm });
  await loadLead();
}

onMounted(loadLead);
</script>
