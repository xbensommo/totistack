<template>
  <FeaturePageShell eyebrow="Forms" title="Form operations" description="Create, publish, and monitor reusable forms from one place.">
    <template #actions>
      <RouterLink to="/admin/forms/new" class="btn-primary">
        <i class="fas fa-plus text-xs"></i>
        Create form
      </RouterLink>
    </template>

    <MetricsGrid :items="stats" />

    <div v-if="forms.length" class="table-wrap">
      <table class="table-base">
        <thead>
          <tr>
            <th>Form</th>
            <th>Status</th>
            <th>Submissions</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="form in forms" :key="form.id">
            <td>
              <p class="font-semibold text-[var(--color-text)]">{{ form.name }}</p>
              <p class="mt-1 text-caption">/{{ form.slug }}</p>
            </td>
            <td>
              <span
                class="badge"
                :class="form.status === 'published' ? 'badge-success' : 'badge-primary'"
              >
                {{ form.status }}
              </span>
            </td>
            <td>{{ form.totalSubmissions || 0 }}</td>
            <td class="text-right">
              <div class="inline-flex flex-wrap justify-end gap-2">
                <RouterLink :to="`/admin/forms/${form.id}`" class="btn-secondary btn-sm">Edit</RouterLink>
                <RouterLink :to="`/admin/forms/${form.id}/submissions`" class="btn-outline btn-sm">Submissions</RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EmptyState v-else title="No forms yet" description="Create your first form to start collecting submissions and triggering workflows.">
      <template #actions>
        <RouterLink to="/admin/forms/new" class="btn-primary">
          <i class="fas fa-plus text-xs"></i>
          Create form
        </RouterLink>
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
