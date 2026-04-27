<template>
  <header class="absolute grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b-2 pb-3" :style="headerStyle">
    <div class="items-start gap-4">
      <div class=" h-14 w-14 overflow-hidden border border-slate-300">
        <img v-if="resolvedLogoUrl" :src="resolvedLogoUrl" alt="Logo" class="max-h-full max-w-full object-contain" @error="clearLogo" />
        <span v-else class="text-lg font-bold" :style="{ color: document.brand.accentColor }">{{ initials }}</span>
      </div>
      <div>
        <!-- <div class="text-lg font-bold" :style="{ color: document.brand.primaryColor }">{{ document.brand.companyName }}</div> -->
        <div class="mt-1 whitespace-pre-line text-sm leading-6 text-slate-500">{{ document.layout.header.leftText || document.brand.legalLine }}</div>
      </div>
    </div>
    <div class="text-right">
      <div class="text-xs font-semibold uppercase tracking-[0.18em]" :style="{ color: document.brand.accentColor }">{{ document.meta.title }}</div>
      <div class="mt-2 text-lg font-bold text-slate-900">{{ document.meta.number || 'Draft' }}</div>
      <div class="mt-2 whitespace-pre-line text-xs leading-6 text-slate-500">
        {{ document.layout.header.rightText || document.brand.contactLine }}
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  document: { type: Object, required: true },
});

const initials = computed(() => {
  const words = String(props.document.brand.companyName || 'D').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
});

const resolvedLogoUrl = computed(() => props.document.brand.logoFileUrl || props.document.brand.logoUrl || '');
const margins = computed(() => props.document.layout?.margins || { top: 40, right: 52, left: 52 });

const headerStyle = computed(() => ({
  left: `${margins.value.left || 0}px`,
  right: `${margins.value.right || 0}px`,
  top: `${margins.value.top || 0}px`,
  borderColor: props.document.brand.primaryColor,
}));

function clearLogo() {
  props.document.brand.logoUrl = '';
  props.document.brand.logoFileUrl = '';
}
</script>
