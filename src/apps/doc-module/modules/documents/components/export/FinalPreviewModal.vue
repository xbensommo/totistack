<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
    <div class="flex h-[92vh] w-full max-w-[1400px] flex-col overflow-hidden border border-slate-300 bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-300 px-5 py-4">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Final Output Preview</div>
          <h3 class="mt-1 text-lg font-bold text-slate-900">{{ title }}</h3>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <iframe class="h-full w-full border-0 bg-slate-100" :srcdoc="html"></iframe>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Preview' },
  html: { type: String, default: '' },
});

defineEmits(['close']);
</script>

<style scoped>
.close-btn {
  border: 1px solid #cbd5e1;
  background: white;
  min-width: 42px;
  min-height: 42px;
  font-size: 1rem;
}
</style>
