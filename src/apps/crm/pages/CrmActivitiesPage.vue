<template>
  <CrmPageShell
    title="Activities"
    description="Keep a searchable timeline of notes, calls, meetings, and follow-up actions."
  >
    <CrmDataTable :columns="columns" :rows="rows" empty-text="No CRM activity recorded yet." />
  </CrmPageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import CrmDataTable from '../components/CrmDataTable.vue';
import CrmPageShell from '../components/CrmPageShell.vue';
import { useCrmService } from '../services/crmService.js';

const { service } = useCrmService();
const rows = ref([]);
const columns = [
  { key: 'type', label: 'Type' },
  { key: 'subject', label: 'Subject' },
  { key: 'outcome', label: 'Outcome' },
  { key: 'assignedTo', label: 'Owner' },
  { key: 'createdAt', label: 'Created' },
];

onMounted(async () => {
  rows.value = await service.fetchActivities();
});
</script>
