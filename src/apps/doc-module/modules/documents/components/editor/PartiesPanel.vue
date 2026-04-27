<template>
  <section class="studio-panel">
    <div class="panel-title">Parties</div>
    <div class="grid gap-6 lg:grid-cols-2">
      <div>
        <div class="sub-title">Issuer</div>
        <div class="grid gap-3">
          <input v-model="documentDraft.parties.issuer.companyName" class="field" placeholder="Company name" />
          <input v-model="documentDraft.parties.issuer.contactName" class="field" placeholder="Contact name" />
          <input v-model="documentDraft.parties.issuer.email" class="field" placeholder="Email" />
          <input v-model="documentDraft.parties.issuer.phone" class="field" placeholder="Phone" />
          <textarea v-model="documentDraft.parties.issuer.address" rows="3" class="field" placeholder="Address"></textarea>
        </div>
      </div>
      <div>
        <div class="sub-title">Client</div>
        <div class="grid gap-3">
          <input v-model="documentDraft.parties.client.companyName" class="field" placeholder="Company name" />
          <input v-model="documentDraft.parties.client.contactName" class="field" placeholder="Contact name" />
          <input v-model="documentDraft.parties.client.email" class="field" placeholder="Email" />
          <input v-model="documentDraft.parties.client.phone" class="field" placeholder="Phone" />
          <textarea v-model="documentDraft.parties.client.address" rows="3" class="field" placeholder="Address"></textarea>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  documentDraft: { type: Object, required: true },
});
</script>

<style scoped>
.studio-panel { border: 1px solid #cbd5e1; background: white; padding: 1rem; }
.panel-title { margin-bottom: 1rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0f766e; }
.sub-title { margin-bottom: 0.75rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #475569; }
.field { width: 100%; border: 1px solid #cbd5e1; background: white; padding: 0.625rem 0.75rem; }
</style>
