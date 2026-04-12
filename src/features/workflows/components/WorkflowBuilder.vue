<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="grid gap-4 md:grid-cols-2">
      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>Workflow name</span>
        <input v-model="model.name" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>Slug</span>
        <input v-model="model.slug" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
    </div>
    <label class="mt-4 block space-y-2 text-sm font-medium text-slate-700">
      <span>Description</span>
      <textarea v-model="model.description" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2"></textarea>
    </label>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>Trigger event</span>
        <input v-model="model.trigger.event" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>Status</span>
        <select v-model="model.status" class="w-full rounded-xl border border-slate-200 px-3 py-2">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </label>
    </div>
  </section>
</template>

<script setup>
/** @file workflows/components/WorkflowBuilder.vue */
defineProps({ model: { type: Object, required: true } })
</script>
