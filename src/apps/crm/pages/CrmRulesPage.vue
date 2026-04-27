<template>
  <CrmPageShell title="Automation and Assignment Rules" description="Starter UI for workflow automation and team ownership rules.">
    <div class="grid gap-6 xl:grid-cols-2">
      <section class="card space-y-4">
        <div><h2 class="section-title">Workflow automation</h2><p class="mt-2 text-sm text-muted">Define starter automation rules for CRM workflows.</p></div>
        <form class="grid gap-4" @submit.prevent="submitAutomationRule">
          <label class="grid gap-2"><span class="field-label mb-0">Rule name</span><input v-model="automationForm.name" class="input-field" required /></label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="grid gap-2"><span class="field-label mb-0">Target module</span><select v-model="automationForm.targetModule" class="select-field"><option value="leads">Leads</option><option value="tasks">Tasks</option><option value="documents">Documents</option></select></label>
            <label class="grid gap-2"><span class="field-label mb-0">Trigger event</span><input v-model="automationForm.triggerEvent" class="input-field" placeholder="lead_created" required /></label>
          </div>
          <button class="btn-primary" type="submit">Add automation rule</button>
        </form>
        <div class="overflow-hidden rounded-theme-xl"><CrmDataTable :columns="automationColumns" :rows="automationRules" empty-text="No automation rules yet." /></div>
      </section>

      <section class="card space-y-4">
        <div><h2 class="section-title">Team assignment rules</h2><p class="mt-2 text-sm text-muted">Set default ownership and routing rules for teams.</p></div>
        <form class="grid gap-4" @submit.prevent="submitAssignmentRule">
          <label class="grid gap-2"><span class="field-label mb-0">Rule name</span><input v-model="assignmentForm.name" class="input-field" required /></label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="grid gap-2"><span class="field-label mb-0">Target module</span><select v-model="assignmentForm.targetModule" class="select-field"><option value="leads">Leads</option><option value="contacts">Contacts</option><option value="accounts">Accounts</option></select></label>
            <label class="grid gap-2"><span class="field-label mb-0">Assign team</span><input v-model="assignmentForm.assignTeam" class="input-field" placeholder="sales" /></label>
          </div>
          <button class="btn-secondary" type="submit">Add assignment rule</button>
        </form>
        <div class="overflow-hidden rounded-theme-xl"><CrmDataTable :columns="assignmentColumns" :rows="assignmentRules" empty-text="No assignment rules yet." /></div>
      </section>
    </div>
  </CrmPageShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import CrmDataTable from '../components/CrmDataTable.vue';
import CrmPageShell from '../components/CrmPageShell.vue';
import { useCrmService } from '../services/crmService.js';

const { service } = useCrmService();
const automationRules = ref([]);
const assignmentRules = ref([]);
const automationForm = reactive({
  name: '',
  targetModule: 'leads',
  triggerEvent: 'lead_created',
});
const assignmentForm = reactive({
  name: '',
  targetModule: 'leads',
  assignTeam: 'sales',
});

const automationColumns = [
  { key: 'name', label: 'Rule' },
  { key: 'targetModule', label: 'Module' },
  { key: 'triggerEvent', label: 'Trigger' },
  { key: 'enabled', label: 'Enabled' },
];

const assignmentColumns = [
  { key: 'name', label: 'Rule' },
  { key: 'targetModule', label: 'Module' },
  { key: 'assignTeam', label: 'Team' },
  { key: 'ownershipMode', label: 'Mode' },
];

async function load() {
  automationRules.value = await service.fetchAutomationRules();
  assignmentRules.value = await service.fetchAssignmentRules();
}

async function submitAutomationRule() {
  await service.createAutomationRule({
    ...automationForm,
    conditions: [{ field: 'status', operator: 'equals', value: 'new' }],
    actions: [{ type: 'create_task', config: { title: 'First follow-up' } }],
  });
  automationForm.name = '';
  automationForm.targetModule = 'leads';
  automationForm.triggerEvent = 'lead_created';
  await load();
}

async function submitAssignmentRule() {
  await service.createAssignmentRule({
    ...assignmentForm,
    ownershipMode: 'team_default',
    conditions: [{ field: 'source', operator: 'equals', value: 'manual' }],
  });
  assignmentForm.name = '';
  assignmentForm.targetModule = 'leads';
  assignmentForm.assignTeam = 'sales';
  await load();
}

onMounted(load);
</script>
