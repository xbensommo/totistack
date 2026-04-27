<template>
  <section class="studio-panel">
    <div class="panel-title">Brand</div>
    <div class="grid gap-4 md:grid-cols-2">
      <label class="block text-sm md:col-span-2">
        <span class="field-label">Company Name</span>
        <input v-model="documentDraft.brand.companyName" class="field" />
      </label>
      <label class="block text-sm md:col-span-2">
        <span class="field-label">Logo URL</span>
        <input v-model="documentDraft.brand.logoUrl" class="field" placeholder="https://..." />
      </label>
      <label class="block text-sm md:col-span-2">
        <span class="field-label">Logo File</span>
        <input type="file" accept="image/*" class="field file-input" @change="onLogoFileChange" />
      </label>
      <div class="border border-slate-300 bg-slate-50 px-4 py-4 md:col-span-2">
        <span class="field-label">Logo Preview</span>
        <div class="mt-2 flex h-24 items-center justify-start overflow-hidden border border-slate-300 bg-white px-4">
          <img v-if="resolvedLogoUrl" :src="resolvedLogoUrl" alt="Logo preview" class="max-h-16 max-w-full object-contain" @error="clearLogo" />
          <span v-else class="text-xl font-bold" :style="{ color: documentDraft.brand.accentColor }">{{ initials }}</span>
        </div>
      </div>
      <label class="block text-sm">
        <span class="field-label">Primary Color</span>
        <input v-model="documentDraft.brand.primaryColor" type="color" class="field h-12 p-1" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Accent Color</span>
        <input v-model="documentDraft.brand.accentColor" type="color" class="field h-12 p-1" />
      </label>
      <label class="block text-sm md:col-span-2">
        <span class="field-label">Legal Line</span>
        <textarea v-model="documentDraft.brand.legalLine" rows="2" class="field"></textarea>
      </label>
      <label class="block text-sm md:col-span-2">
        <span class="field-label">Contact Line</span>
        <input v-model="documentDraft.brand.contactLine" class="field" />
      </label>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  documentDraft: { type: Object, required: true },
});

const resolvedLogoUrl = computed(() => props.documentDraft.brand.logoFileUrl || props.documentDraft.brand.logoUrl || '');
const initials = computed(() => String(props.documentDraft.brand.companyName || 'BD')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase());

function onLogoFileChange(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    props.documentDraft.brand.logoFileUrl = String(reader.result || '');
  };
  reader.readAsDataURL(file);
}

function clearLogo() {
  props.documentDraft.brand.logoUrl = '';
  props.documentDraft.brand.logoFileUrl = '';
}
</script>

<style scoped>
.studio-panel { border: 1px solid #cbd5e1; background: white; padding: 1rem; }
.panel-title { margin-bottom: 1rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0f766e; }
.field-label { display: block; margin-bottom: 0.35rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; }
.field { width: 100%; border: 1px solid #cbd5e1; background: white; padding: 0.625rem 0.75rem; }
.file-input { padding: 0.35rem 0.45rem; }
.file-input::file-selector-button { margin-right: 0.75rem; border: 0; background: #e2e8f0; padding: 0.5rem 0.75rem; font-weight: 600; }
</style>
