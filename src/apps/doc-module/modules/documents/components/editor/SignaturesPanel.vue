<template>
  <section class="studio-panel">
    <div class="panel-title">Signatures</div>
    <div class="grid gap-6 lg:grid-cols-2">
      <div>
        <div class="sub-title">Issuer Signature</div>
        <SignaturePadField v-model="documentDraft.signatures.issuer" />
      </div>
      <div>
        <div class="sub-title">Client Signature</div>
        <SignaturePadField v-model="documentDraft.signatures.client" />
      </div>
    </div>
  </section>
</template>

<script setup>
import SignaturePadField from './SignaturePadField.vue';

defineProps({
  documentDraft: { type: Object, required: true },
});
</script>

<style scoped>
.studio-panel { border: 1px solid #cbd5e1; background: white; padding: 1rem; }
.panel-title { margin-bottom: 1rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0f766e; }
.sub-title { margin-bottom: 0.75rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #475569; }
</style>
