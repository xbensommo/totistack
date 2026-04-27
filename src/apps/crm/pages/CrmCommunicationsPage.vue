<template>
  <CrmPageShell title="WhatsApp and Email Logs" description="Keep communication history inside the CRM even before full provider integrations are connected.">
    <template #actions>
      <div class="card-soft w-full lg:min-w-[860px]">
        <form class="grid gap-4 xl:grid-cols-[0.85fr_1fr_1.3fr_auto] xl:items-end" @submit.prevent="submitMessage">
          <label class="grid gap-2">
            <span class="field-label mb-0">Channel</span>
            <select v-model="form.channel" class="select-field">
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="call">Call</option>
            </select>
          </label>
          <label class="grid gap-2">
            <span class="field-label mb-0">Subject</span>
            <input v-model="form.subject" class="input-field" />
          </label>
          <label class="grid gap-2">
            <span class="field-label mb-0">Body</span>
            <input v-model="form.body" class="input-field" required />
          </label>
          <button class="btn-primary" type="submit">Log message</button>
        </form>
      </div>
    </template>

    <section class="card p-0 overflow-hidden">
      <CrmDataTable :columns="columns" :rows="rows" empty-text="No communication history logged yet." />
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
  channel: 'whatsapp',
  subject: '',
  body: '',
});

const columns = [
  { key: 'channel', label: 'Channel' },
  { key: 'direction', label: 'Direction' },
  { key: 'subject', label: 'Subject' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Owner' },
];

async function load() {
  rows.value = await service.fetchMessages();
}

async function submitMessage() {
  await service.logMessage({ ...form });
  form.channel = 'whatsapp';
  form.subject = '';
  form.body = '';
  await load();
}

onMounted(load);
</script>
