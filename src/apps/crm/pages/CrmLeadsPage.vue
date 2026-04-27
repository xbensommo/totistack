<template>
  <CrmPageShell title="CRM Leads" description="Manage incoming leads, assign ownership, and keep the pipeline moving.">
    <template #actions>
      <div class="card-soft w-full lg:min-w-[820px]">
        <form class="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr_auto] xl:items-end" @submit.prevent="submitLead">
          <label class="grid gap-2">
            <span class="field-label mb-0">First name</span>
            <input v-model="form.firstName" class="input-field" placeholder="John" required />
          </label>
          <label class="grid gap-2">
            <span class="field-label mb-0">Last name</span>
            <input v-model="form.lastName" class="input-field" placeholder="Doe" required />
          </label>
          <label class="grid gap-2">
            <span class="field-label mb-0">Company</span>
            <input v-model="form.company" class="input-field" placeholder="Acme Corp" />
          </label>
          <button class="btn-primary" type="submit"><i class="fa fa-plus"></i><span>Add lead</span></button>
        </form>
      </div>
    </template>

    <section class="card p-0 overflow-hidden">
      <CrmDataTable :columns="columns" :rows="rows" empty-text="No leads available yet." />
    </section>
  </CrmPageShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import CrmDataTable from '../components/CrmDataTable.vue';
import CrmPageShell from '../components/CrmPageShell.vue';
import { useCrmService } from '../services/crmService.js';

const { service } = useCrmService();
const rows = ref([]);
const form = reactive({ firstName: '', lastName: '', company: '' });

const columns = [
  { key: 'fullName', label: 'Lead' },
  { key: 'company', label: 'Company' },
  { key: 'status', label: 'Status' },
  { key: 'source', label: 'Source' },
  { key: 'assignedTo', label: 'Owner' },
];

async function load() { rows.value = await service.fetchLeads(); }
async function submitLead() {
  await service.createLead({ ...form });
  form.firstName = ''; form.lastName = ''; form.company = '';
  await load();
}

onMounted(load);
</script>