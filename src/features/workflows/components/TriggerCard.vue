<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Trigger</p>
    <h3 class="mt-2 text-lg font-semibold text-slate-900">{{ trigger.type }}</h3>
    <p class="mt-2 text-sm text-slate-600">{{ trigger.event }}</p>
  </article>
</template>

<script setup>
/** @file workflows/components/TriggerCard.vue */
defineProps({ trigger: { type: Object, required: true } })
</script>
