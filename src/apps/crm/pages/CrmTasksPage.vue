<template>
  <CrmPageShell title="Tasks and Follow-ups" description="Manage reminders, next actions, and customer follow-up ownership.">
    <template #actions>
      <div class="card-soft w-full lg:min-w-[860px]">
        <form class="grid gap-4 xl:grid-cols-[1.3fr_0.9fr_0.9fr_auto] xl:items-end" @submit.prevent="submitTask">
          <label class="grid gap-2"><span class="field-label mb-0">Task title</span><input v-model="form.title" class="input-field" required /></label>
          <label class="grid gap-2"><span class="field-label mb-0">Type</span><select v-model="form.type" class="select-field"><option value="follow_up">Follow-up</option><option value="call">Call</option><option value="meeting">Meeting</option><option value="email">Email</option></select></label>
          <label class="grid gap-2"><span class="field-label mb-0">Due date</span><input v-model="form.dueAt" class="input-field" type="date" /></label>
          <button class="btn-primary" type="submit">Add task</button>
        </form>
      </div>
    </template>

    <section class="card p-0 overflow-hidden">
      <CrmDataTable :columns="columns" :rows="rows" empty-text="No tasks logged yet.">
        <template #cell-status="{ row }">
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge">{{ row.status || 'open' }}</span>
            <button v-if="row.status !== 'completed'" class="btn-outline btn-sm" type="button" @click="complete(row.id)">Complete</button>
          </div>
        </template>
      </CrmDataTable>
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
  title: '',
  type: 'follow_up',
  dueAt: '',
});

const columns = [
  { key: 'title', label: 'Task' },
  { key: 'type', label: 'Type' },
  { key: 'priority', label: 'Priority' },
  { key: 'dueAt', label: 'Due' },
  { key: 'status', label: 'Status' },
  { key: 'assignedTo', label: 'Owner' },
];

async function load() {
  rows.value = await service.fetchTasks();
}

async function submitTask() {
  await service.createTask({ ...form });
  form.title = '';
  form.type = 'follow_up';
  form.dueAt = '';
  await load();
}

async function complete(id) {
  await service.completeTask(id);
  await load();
}

onMounted(load);
</script>
