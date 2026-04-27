<template>
  <CrmPageShell title="Accounts / Companies" description="Track customer companies, ownership, and account-level history.">
    <template #actions>
      <div class="card-soft w-full lg:min-w-[640px]">
        <form class="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" @submit.prevent="submitAccount">
          <label class="grid gap-2">
            <span class="field-label mb-0">Company name</span>
            <input v-model="form.name" class="input-field" required />
          </label>
          <label class="grid gap-2">
            <span class="field-label mb-0">Industry</span>
            <input v-model="form.industry" class="input-field" />
          </label>
          <button class="btn-primary" type="submit">Add account</button>
        </form>
      </div>
    </template>

    <section class="card p-0 overflow-hidden">
      <CrmDataTable :columns="columns" :rows="rows" empty-text="No accounts have been added yet." />
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
const form = reactive({
  name: '',
  industry: '',
});

const columns = [
  { key: 'name', label: 'Account' },
  { key: 'accountNumber', label: 'Number' },
  { key: 'industry', label: 'Industry' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Owner' },
];

async function load() {
  rows.value = await service.fetchAccounts();
}

async function submitAccount() {
  await service.createAccount({ ...form });
  form.name = '';
  form.industry = '';
  await load();
}

onMounted(load);
</script>
