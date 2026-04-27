<template>
  <section class="studio-panel">
    <div class="panel-title">Financials</div>
    <div class="grid gap-4 md:grid-cols-3">
      <label class="block text-sm">
        <span class="field-label">Tax Rate %</span>
        <input v-model.number="documentDraft.finance.taxRate" type="number" min="0" step="0.01" class="field" />
      </label>
      <div class="summary-box">
        <span class="summary-label">Subtotal</span>
        <strong>{{ formatMoney(normalizedDocument.finance.subtotal, normalizedDocument.meta.currency) }}</strong>
      </div>
      <div class="summary-box">
        <span class="summary-label">Total</span>
        <strong>{{ formatMoney(normalizedDocument.finance.total, normalizedDocument.meta.currency) }}</strong>
      </div>
    </div>
    <div class="mt-4">
      <RichTextBlockEditor v-model="documentDraft.finance.paymentTermsHtml" label="Payment Terms" />
    </div>
  </section>
</template>

<script setup>
import { formatMoney } from '../../utils/money.js';
import RichTextBlockEditor from './RichTextBlockEditor.vue';

defineProps({
  documentDraft: { type: Object, required: true },
  normalizedDocument: { type: Object, required: true },
});
</script>

<style scoped>
.studio-panel { border: 1px solid #cbd5e1; background: white; padding: 1rem; }
.panel-title { margin-bottom: 1rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0f766e; }
.field-label { display: block; margin-bottom: 0.35rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; }
.field { width: 100%; border: 1px solid #cbd5e1; background: white; padding: 0.625rem 0.75rem; }
.summary-box { border: 1px solid #cbd5e1; background: #f8fafc; padding: 0.85rem 1rem; display: flex; flex-direction: column; justify-content: center; }
.summary-label { margin-bottom: 0.35rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; }
</style>
