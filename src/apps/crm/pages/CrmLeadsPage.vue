<template>
  <CrmPageShell
    title="CRM Leads"
    description="Manage incoming leads, assign ownership, and keep the pipeline moving from one place."
  >
    <template #actions>
      <form class="flex flex-wrap items-end gap-3" @submit.prevent="submitLead">
        <label class="grid gap-1">
          <span class="text-xs font-medium text-slate-600">First name</span>
          <input v-model="form.firstName" class="rounded-xl border border-slate-300 px-3 py-2" required />
        </label>
        <label class="grid gap-1">
          <span class="text-xs font-medium text-slate-600">Last name</span>
          <input v-model="form.lastName" class="rounded-xl border border-slate-300 px-3 py-2" required />
        </label>
        <label class="grid gap-1">
          <span class="text-xs font-medium text-slate-600">Company</span>
          <input v-model="form.company" class="rounded-xl border border-slate-300 px-3 py-2" />
        </label>
        <button class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
          Add lead
        </button>
      </form>
    </template>

    <CrmDataTable :columns="columns" :rows="rows" empty-text="No leads available yet." />
  </CrmPageShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import CrmDataTable from '../components/CrmDataTable.vue';
import CrmPageShell from '../components/CrmPageShell.vue';
import { useCrmService } from '../services/crmService.js';

const { service } = useCrmService();
const rows = ref([]);
const form = reactive({
  firstName: '',
  lastName: '',
  company: '',
});

const columns = [
  { key: 'fullName', label: 'Lead' },
  { key: 'company', label: 'Company' },
  { key: 'status', label: 'Status' },
  { key: 'source', label: 'Source' },
  { key: 'assignedTo', label: 'Owner' },
];

async function load() {
  rows.value = await service.fetchLeads();
}

async function submitLead() {
  await service.createLead({ ...form });
  form.firstName = '';
  form.lastName = '';
  form.company = '';
  await load();
}

onMounted(load);
</script>
