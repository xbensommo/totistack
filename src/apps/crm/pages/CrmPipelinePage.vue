<template>
  <CrmPageShell
    title="Pipeline"
    description="Starter pipeline board grouped by stage. Extend this view with drag-and-drop or forecasting rules later."
  >
    <div class="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
      <section
        v-for="stage in stageGroups"
        :key="stage.stage"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <header class="mb-4 flex items-center justify-between gap-2">
          <h2 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
            {{ stage.stage }}
          </h2>
          <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            {{ stage.items.length }}
          </span>
        </header>

        <div class="space-y-3">
          <article
            v-for="item in stage.items"
            :key="item.id"
            class="rounded-xl border border-slate-200 p-3"
          >
            <p class="font-medium text-slate-900">{{ item.name }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ currency(item.amount) }}</p>
            <select
              class="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              :value="item.stage"
              @change="moveStage(item.id, $event.target.value)"
            >
              <option v-for="stageName in stageNames" :key="stageName" :value="stageName">
                {{ stageName }}
              </option>
            </select>
          </article>
          <p v-if="stage.items.length === 0" class="text-sm text-slate-400">
            No opportunities in this stage.
          </p>
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
