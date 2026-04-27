<template>
  <section class="studio-panel">
    <div class="mb-4 flex items-center justify-between">
      <div class="panel-title !mb-0">{{ title }}</div>
      <button type="button" class="action-btn" @click="$emit('add')">Add</button>
    </div>

    <div class="space-y-4">
      <article v-for="(item, index) in items" :key="item.id || index" class="border border-slate-300 bg-slate-50 p-4">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{{ singularLabel }} {{ index + 1 }}</span>
          <button type="button" class="remove-btn" @click="$emit('remove', index)">Remove</button>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <input v-model="item.label" class="field" placeholder="Label" />
          <input v-model="item.value" class="field md:col-span-1" placeholder="Value" />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Items' },
  singularLabel: { type: String, default: 'Item' },
  items: { type: Array, default: () => [] },
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
