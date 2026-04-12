<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 class="text-lg font-semibold text-slate-900">Credentials</h3>
    <p class="mt-1 text-sm text-slate-500">Starter credential editor. Swap this with a secure secret vault integration in production.</p>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <label v-for="field in fields" :key="field.key" class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ field.label }}</span>
        <input v-model="model[field.key]" :type="field.secret ? 'password' : 'text'" class="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
    </div>
  </section>
</template>

<script setup>
/**
 * @file integrations/components/CredentialsForm.vue
 * @description Starter credential form used by integration detail pages.
 */
defineProps({
  model: { type: Object, required: true },
  fields: { type: Array, default: () => [] },
})
</script>
