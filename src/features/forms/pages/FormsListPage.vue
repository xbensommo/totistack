<template>
  <FeaturePageShell eyebrow="Forms" title="Form operations" description="Create, publish, and monitor reusable forms from one place.">
    <template #actions>
      <RouterLink to="/admin/forms/new" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Create form</RouterLink>
    </template>

    <MetricsGrid :items="stats" />

    <div v-if="forms.length" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Form</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
            <th class="px-4 py-3 text-left font-semibold text-slate-600">Submissions</th>
            <th class="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="form in forms" :key="form.id">
            <td class="px-4 py-3">
              <p class="font-semibold text-slate-900">{{ form.name }}</p>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">/{{ form.slug }}</p>
            </td>
            <td class="px-4 py-3"><span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{{ form.status }}</span></td>
            <td class="px-4 py-3 text-slate-700">{{ form.totalSubmissions || 0 }}</td>
            <td class="px-4 py-3 text-right">
              <div class="inline-flex gap-2">
                <RouterLink :to="`/admin/forms/${form.id}`" class="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Edit</RouterLink>
                <RouterLink :to="`/admin/forms/${form.id}/submissions`" class="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Submissions</RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <EmptyState v-else title="No forms yet" description="Create your first form to start collecting submissions and triggering workflows.">
      <template #actions>
        <RouterLink to="/admin/forms/new" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Create form</RouterLink>
      </template>
    </EmptyState>
  </FeaturePageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import MetricsGrid from '../components/MetricsGrid.vue'
import EmptyState from '../components/EmptyState.vue'
import { createFormsService } from '../services/formsService.js'

const formsService = createFormsService()
const forms = ref([])

const stats = computed(() => {
  const total = forms.value.length
  const published = forms.value.filter((item) => item.status === 'published').length
  const draft = forms.value.filter((item) => item.status === 'draft').length
  const submissions = forms.value.reduce((sum, item) => sum + Number(item.totalSubmissions || 0), 0)
  return [
    { label: 'Total forms', value: total, hint: 'All configured forms' },
    { label: 'Published', value: published, hint: 'Live and available' },
    { label: 'Drafts', value: draft, hint: 'Still being prepared' },
    { label: 'Submissions', value: submissions, hint: 'Captured responses' },
  ]
})

onMounted(async () => {
  forms.value = await formsService.listForms()
})
</script>
