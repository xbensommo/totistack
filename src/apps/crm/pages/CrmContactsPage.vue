<template>
  <CrmPageShell title="Contacts" description="People linked to leads, accounts, and opportunities.">
    <template #actions>
      <div class="card-soft w-full lg:min-w-[780px]">
        <form class="grid gap-4 xl:grid-cols-[1fr_1fr_1.2fr_auto] xl:items-end" @submit.prevent="submitContact">
          <label class="grid gap-2">
            <span class="field-label mb-0">First name</span>
            <input v-model="form.firstName" class="input-field" required />
          </label>
          <label class="grid gap-2">
            <span class="field-label mb-0">Last name</span>
            <input v-model="form.lastName" class="input-field" required />
          </label>
          <label class="grid gap-2">
            <span class="field-label mb-0">Email</span>
            <input v-model="form.email" class="input-field" type="email" />
          </label>
          <button class="btn-primary" type="submit">Add contact</button>
        </form>
      </div>
    </template>

    <section class="card p-0 overflow-hidden">
      <CrmDataTable :columns="columns" :rows="rows" empty-text="No contacts available yet." />
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
  firstName: '',
  lastName: '',
  email: '',
});

const columns = [
  { key: 'fullName', label: 'Contact' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Owner' },
];

async function load() {
  rows.value = await service.fetchContacts();
}

async function submitContact() {
  await service.createContact({ ...form });
  form.firstName = '';
  form.lastName = '';
  form.email = '';
  await load();
}

onMounted(load);
</script>
