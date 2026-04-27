<template>
  <CrmPageShell title="Pipeline" description="Starter pipeline board grouped by stage. Extend this view with drag-and-drop or forecasting rules later.">
    <div class="pipeline-board grid-auto-fit-card">
      <section v-for="stage in stageGroups" :key="stage.stage" class="pipeline-column">
        <header class="pipeline-column-title"><span>{{ stage.stage }}</span><span class="badge">{{ stage.items.length }}</span></header>
        <div class="space-y-3">
          <article v-for="item in stage.items" :key="item.id" class="pipeline-card">
            <p class="font-semibold text-[var(--color-text)]">{{ item.name }}</p>
            <p class="mt-1 text-sm text-muted">{{ currency(item.amount) }}</p>
            <select class="select-field mt-3" :value="item.stage" @change="moveStage(item.id, $event.target.value)">
              <option v-for="stageName in stageNames" :key="stageName" :value="stageName">{{ stageName }}</option>
            </select>
          </article>
          <div v-if="stage.items.length === 0" class="card-soft p-4 text-sm text-muted">No opportunities in this stage.</div>
        </div>
      </section>
    </div>
  </CrmPageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import CrmPageShell from '../components/CrmPageShell.vue';
import { CRM_PIPELINE_STAGES, useCrmService } from '../services/crmService.js';

const { service } = useCrmService();
const stageGroups = ref([]);
const stageNames = CRM_PIPELINE_STAGES;

function currency(value) {
  return new Intl.NumberFormat('en-NA', {
    style: 'currency',
    currency: 'NAD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

async function load() {
  const snapshot = await service.fetchDashboardSnapshot();
  stageGroups.value = snapshot.opportunitiesByStage;
}

async function moveStage(opportunityId, stage) {
  await service.moveOpportunityStage(opportunityId, stage);
  await load();
}

onMounted(load);
</script>
