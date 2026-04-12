<template>
  <CrmPageShell
    title="Opportunities"
    description="Track deal value, expected close dates, and ownership across the sales funnel."
  >
    <CrmDataTable :columns="columns" :rows="rows" empty-text="No opportunities yet." />
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
  { key: 'name', label: 'Opportunity' },
  { key: 'stage', label: 'Stage' },
  { key: 'amount', label: 'Amount' },
  { key: 'probability', label: 'Probability' },
  { key: 'owner', label: 'Owner' },
];

onMounted(async () => {
  rows.value = await service.fetchOpportunities();
});
</script>
