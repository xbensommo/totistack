<template>
  <CrmPageShell title="Quotes, Invoices, and Receipts" description="Create customer documents with realistic placeholder data while the real document generator package plugs in later.">
    <template #actions>
      <div class="card-soft w-full lg:min-w-[860px]">
        <form class="grid gap-4 xl:grid-cols-[0.85fr_1.3fr_0.9fr_auto] xl:items-end" @submit.prevent="submitDocument">
          <label class="grid gap-2">
            <span class="field-label mb-0">Type</span>
            <select v-model="form.documentType" class="select-field">
              <option value="quote">Quote</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
            </select>
          </label>
          <label class="grid gap-2">
            <span class="field-label mb-0">Title</span>
            <input v-model="form.title" class="input-field" required />
          </label>
          <label class="grid gap-2">
            <span class="field-label mb-0">Total amount</span>
            <input v-model.number="form.totalAmount" class="input-field" min="0" type="number" />
          </label>
          <button class="btn-primary" type="submit">Create document</button>
        </form>
      </div>
    </template>

    <div class="space-y-6">
      <section class="card p-0 overflow-hidden">
        <CrmDataTable :columns="columns" :rows="rows" empty-text="No documents have been generated yet." />
      </section>

      <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div class="card space-y-4">
          <div>
            <h2 class="section-title">Attach supporting file metadata</h2>
            <p class="mt-2 text-sm text-muted">Store placeholders for file references while the real file layer is connected.</p>
          </div>
          <form class="grid gap-4" @submit.prevent="submitAttachment">
            <label class="grid gap-2">
              <span class="field-label mb-0">File name</span>
              <input v-model="attachmentForm.fileName" class="input-field" required />
            </label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="grid gap-2">
                <span class="field-label mb-0">File type</span>
                <input v-model="attachmentForm.fileType" class="input-field" placeholder="application/pdf" />
              </label>
              <label class="grid gap-2">
                <span class="field-label mb-0">File size (bytes)</span>
                <input v-model.number="attachmentForm.fileSize" class="input-field" min="0" type="number" />
              </label>
            </div>
            <button class="btn-secondary" type="submit">Save attachment metadata</button>
          </form>
        </div>

        <section class="card p-0 overflow-hidden">
          <CrmDataTable :columns="attachmentColumns" :rows="attachments" empty-text="No attachment metadata yet." />
        </section>
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
const rows = ref([]);
const attachments = ref([]);
const form = reactive({
  documentType: 'quote',
  title: '',
  totalAmount: 0,
});
const attachmentForm = reactive({
  fileName: '',
  fileType: 'application/pdf',
  fileSize: 0,
});

const columns = [
  { key: 'documentType', label: 'Type' },
  { key: 'documentNumber', label: 'Number' },
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status' },
  { key: 'totalAmount', label: 'Total' },
];

const attachmentColumns = [
  { key: 'fileName', label: 'File name' },
  { key: 'fileType', label: 'Type' },
  { key: 'fileSize', label: 'Size' },
  { key: 'visibility', label: 'Visibility' },
];

async function load() {
  rows.value = await service.fetchDocuments();
  attachments.value = await service.fetchAttachments();
}

async function submitDocument() {
  await service.createDocument({
    ...form,
    lineItems: [
      { name: 'Service package', quantity: 1, unitPrice: Number(form.totalAmount || 0), total: Number(form.totalAmount || 0) },
    ],
  });
  form.documentType = 'quote';
  form.title = '';
  form.totalAmount = 0;
  await load();
}

async function submitAttachment() {
  await service.createAttachment({ ...attachmentForm });
  attachmentForm.fileName = '';
  attachmentForm.fileType = 'application/pdf';
  attachmentForm.fileSize = 0;
  await load();
}

onMounted(load);
</script>
