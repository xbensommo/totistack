<template>
  <CrmPageShell title="Lead detail" description="Review lead context, notes, customer history, and convert it into an opportunity when ready.">
    <div class="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section class="card space-y-6">
        <div v-if="workspace.lead" class="space-y-5">
          <div>
            <span class="section-label">Lead</span>
            <h2 class="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">
              {{ workspace.lead.fullName || [workspace.lead.firstName, workspace.lead.lastName].filter(Boolean).join(' ') }}
            </h2>
          </div>
          <dl class="grid gap-4 sm:grid-cols-2">
            <div class="card-soft p-4"><dt class="text-caption">Company</dt><dd class="mt-2 text-sm text-soft">{{ workspace.lead.company || '—' }}</dd></div>
            <div class="card-soft p-4"><dt class="text-caption">Email</dt><dd class="mt-2 text-sm text-soft">{{ workspace.lead.email || '—' }}</dd></div>
            <div class="card-soft p-4"><dt class="text-caption">Status</dt><dd class="mt-2"><span class="badge badge-primary">{{ workspace.lead.status || 'new' }}</span></dd></div>
            <div class="card-soft p-4"><dt class="text-caption">Source</dt><dd class="mt-2 text-sm text-soft">{{ workspace.lead.source || 'manual' }}</dd></div>
          </dl>
          <div class="card-soft p-5">
            <p class="text-caption">Notes</p>
            <p class="mt-3 text-sm leading-7 text-soft">{{ workspace.lead.notes || 'No notes recorded for this lead.' }}</p>
          </div>
        </div>
        <div v-else class="empty-state"><p class="text-sm text-muted">Lead not found.</p></div>

        <div class="grid gap-4 md:grid-cols-3">
          <article class="metric-card p-4"><p class="stat-title">Timeline events</p><p class="stat-value text-3xl">{{ workspace.timeline.length }}</p></article>
          <article class="metric-card p-4"><p class="stat-title">Tasks</p><p class="stat-value text-3xl">{{ workspace.tasks.length }}</p></article>
          <article class="metric-card p-4"><p class="stat-title">Documents</p><p class="stat-value text-3xl">{{ workspace.documents.length }}</p></article>
        </div>
      </section>

      <section class="card space-y-6">
        <div>
          <h3 class="section-title">Convert to opportunity</h3>
          <form class="mt-4 grid gap-4" @submit.prevent="convertLead">
            <label class="grid gap-2"><span class="field-label mb-0">Opportunity name</span><input v-model="convertForm.name" class="input-field" required /></label>
            <label class="grid gap-2"><span class="field-label mb-0">Amount</span><input v-model.number="convertForm.amount" class="input-field" min="0" type="number" /></label>
            <button class="btn-primary" type="submit">Convert lead</button>
          </form>
        </div>

        <div>
          <h3 class="section-title">Quick note</h3>
          <form class="mt-4 grid gap-4" @submit.prevent="submitNote">
            <textarea v-model="noteBody" class="textarea-field" placeholder="Add an internal note"></textarea>
            <button class="btn-secondary" type="submit">Save note</button>
          </form>
        </div>
      </section>
    </div>

    <section class="card space-y-4">
      <h3 class="section-title">Lead timeline</h3>
      <ul class="space-y-4">
        <li v-for="event in workspace.timeline" :key="event.id" class="list-row items-start">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2"><p class="font-medium text-[var(--color-text)]">{{ event.title }}</p><span class="badge">{{ event.entity }}</span></div>
            <p class="mt-2 text-sm text-muted">{{ event.description || 'No additional context.' }}</p>
          </div>
        </li>
        <li v-if="workspace.timeline.length === 0" class="empty-state"><p class="text-sm text-muted">No customer history has been logged for this lead yet.</p></li>
      </ul>
    </section>
  </CrmPageShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import CrmPageShell from '../components/CrmPageShell.vue';
import { useCrmService } from '../services/crmService.js';

const route = useRoute();
const { service } = useCrmService();
const noteBody = ref('');
const workspace = reactive({
  lead: null,
  timeline: [],
  tasks: [],
  documents: [],
  messages: [],
});
const convertForm = reactive({
  name: '',
  amount: 0,
});

async function loadLead() {
  const result = await service.fetchLeadWorkspace(route.params.id);
  Object.assign(workspace, result);
  if (workspace.lead && !convertForm.name) {
    convertForm.name = `${workspace.lead.company || workspace.lead.fullName || 'Lead'} Opportunity`;
  }
}

async function convertLead() {
  await service.convertLeadToOpportunity(route.params.id, { ...convertForm });
  await loadLead();
}

async function submitNote() {
  if (!noteBody.value.trim()) return;
  await service.createNote({ leadId: route.params.id, body: noteBody.value.trim(), title: 'Lead note' });
  noteBody.value = '';
  await loadLead();
}

onMounted(loadLead);
</script>
