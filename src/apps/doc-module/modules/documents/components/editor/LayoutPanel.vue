<template>
  <section class="studio-panel">
    <div class="panel-title">Layout</div>
    <div class="grid gap-4 md:grid-cols-2">
      <label class="block text-sm">
        <span class="field-label">Watermark</span>
        <select v-model="documentDraft.layout.watermark.preset" class="field" @change="syncWatermarkPreset">
          <option v-for="preset in watermarkPresets" :key="preset.value" :value="preset.value">
            {{ preset.label }}
          </option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="field-label">Watermark Text</span>
        <input v-model="documentDraft.layout.watermark.text" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Header Height</span>
        <input v-model.number="documentDraft.layout.header.height" type="number" min="72" step="4" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Footer Height</span>
        <input v-model.number="documentDraft.layout.footer.height" type="number" min="36" step="4" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Top Margin</span>
        <input v-model.number="documentDraft.layout.margins.top" type="number" min="24" step="2" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Bottom Margin</span>
        <input v-model.number="documentDraft.layout.margins.bottom" type="number" min="24" step="2" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Left Margin</span>
        <input v-model.number="documentDraft.layout.margins.left" type="number" min="24" step="2" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Right Margin</span>
        <input v-model.number="documentDraft.layout.margins.right" type="number" min="24" step="2" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Header Left</span>
        <textarea v-model="documentDraft.layout.header.leftText" rows="2" class="field"></textarea>
      </label>
      <label class="block text-sm">
        <span class="field-label">Header Right</span>
        <textarea v-model="documentDraft.layout.header.rightText" rows="2" class="field"></textarea>
      </label>
      <label class="block text-sm">
        <span class="field-label">Footer Left</span>
        <input v-model="documentDraft.layout.footer.leftText" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Footer Center</span>
        <input v-model="documentDraft.layout.footer.centerText" class="field" />
      </label>
      <label class="block text-sm md:col-span-2">
        <span class="field-label">Footer Right</span>
        <input v-model="documentDraft.layout.footer.rightText" class="field" />
      </label>
      <label class="flex items-center gap-3 border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 md:col-span-2">
        <input v-model="documentDraft.layout.footer.showPageNumbers" type="checkbox" />
        <span>Show page numbers</span>
      </label>
    </div>
  </section>
</template>

<script setup>
import { WATERMARK_PRESETS } from '../../core/constants.js';

const props = defineProps({
  documentDraft: { type: Object, required: true },
});

const watermarkPresets = WATERMARK_PRESETS;

function syncWatermarkPreset() {
  const matched = watermarkPresets.find((entry) => entry.value === props.documentDraft.layout.watermark.preset);
  if (!matched) return;
  props.documentDraft.layout.watermark.text = matched.text;
  props.documentDraft.layout.watermark.opacity = matched.opacity;
  props.documentDraft.layout.watermark.rotation = matched.rotation;
}
</script>

<style scoped>
.studio-panel { border: 1px solid #cbd5e1; background: white; padding: 1rem; }
.panel-title { margin-bottom: 1rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0f766e; }
.field-label { display: block; margin-bottom: 0.35rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; }
.field { width: 100%; border: 1px solid #cbd5e1; background: white; padding: 0.625rem 0.75rem; }
</style>
