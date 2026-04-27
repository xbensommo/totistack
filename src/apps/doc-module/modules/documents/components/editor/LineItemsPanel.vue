<template>
  <section class="studio-panel">
    <div class="mb-4 flex items-center justify-between">
      <div class="panel-title !mb-0">Line Items</div>
      <button type="button" class="action-btn" @click="$emit('add')">Add Line Item</button>
    </div>

    <div class="space-y-4">
      <article v-for="(item, index) in items" :key="item.id || index" class="border border-slate-300 bg-slate-50 p-4">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Item {{ index + 1 }}</span>
          <button type="button" class="remove-btn" @click="$emit('remove', index)">Remove</button>
        </div>
        <div class="grid gap-3 md:grid-cols-3">
          <textarea v-model="item.description" rows="3" class="field md:col-span-3" placeholder="Description"></textarea>
          <input v-model.number="item.quantity" type="number" min="0" class="field" placeholder="Qty" />
          <input v-model.number="item.unitPrice" type="number" min="0" step="0.01" class="field" placeholder="Rate" />
          <div class="border border-slate-300 bg-white px-4 py-3 text-sm">
            <span class="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Line Total</span>
            <strong class="mt-1 block">{{ formatMoney((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), currency) }}</strong>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { formatMoney } from '../../utils/money.js';

defineProps({
  items: { type: Array, default: () => [] },
  currency: { type: String, default: 'NAD' },
});

defineEmits(['add', 'remove']);
</script>

<style scoped>
.studio-panel { border: 1px solid #cbd5e1; background: white; padding: 1rem; }
.panel-title { margin-bottom: 1rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0f766e; }
.field { width: 100%; border: 1px solid #cbd5e1; background: white; padding: 0.625rem 0.75rem; }
.action-btn { border: 1px solid #0f172a; background: #0f172a; color: white; padding: 0.55rem 0.8rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.remove-btn { border: 1px solid #dc2626; background: white; color: #dc2626; padding: 0.35rem 0.65rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
</style>
