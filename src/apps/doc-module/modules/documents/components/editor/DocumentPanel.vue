<template>
  <section class="studio-panel">
    <div class="panel-title">Document</div>
    <div class="grid gap-4 md:grid-cols-2">
      <label class="block text-sm">
        <span class="field-label">Title</span>
        <input v-model="documentDraft.meta.title" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Number</span>
        <input v-model="documentDraft.meta.number" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Status</span>
        <select v-model="documentDraft.meta.status" class="field">
          <option v-for="status in definition.statuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="field-label">Currency</span>
        <input v-model="documentDraft.meta.currency" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Issued On</span>
        <input v-model="documentDraft.meta.issuedOn" type="date" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Effective On</span>
        <input v-model="documentDraft.meta.effectiveOn" type="date" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Due On</span>
        <input v-model="documentDraft.meta.dueOn" type="date" class="field" />
      </label>
      <label class="block text-sm">
        <span class="field-label">Reference</span>
        <input v-model="documentDraft.meta.reference" class="field" />
      </label>
    </div>
  </section>
</template>

<script setup>
defineProps({
  documentDraft: { type: Object, required: true },
  definition: { type: Object, required: true },
});
</script>

<style scoped>
.studio-panel {
  border: 1px solid #cbd5e1;
  background: white;
  padding: 1rem;
}
.panel-title {
  margin-bottom: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0f766e;
}
.field-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}
.field {
  width: 100%;
  border: 1px solid #cbd5e1;
  background: white;
  padding: 0.625rem 0.75rem;
}
</style>
