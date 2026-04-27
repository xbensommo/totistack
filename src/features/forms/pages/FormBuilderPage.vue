<template>
  <FeaturePageShell
    eyebrow="Forms"
    :title="pageTitle"
    description="Use this starter builder to define fields, labels, and core form settings."
  >
    <template #actions>
      <button type="button" class="btn-primary" @click="save">
        <i class="fas fa-floppy-disk text-xs"></i>
        Save form
      </button>
    </template>

    <div class="grid gap-6 xl:grid-cols-[320px,1fr]">
      <FormFieldsPalette :fields="fieldLibrary" @add="addField" />

      <div class="space-y-6">
        <section class="card">
          <div class="mb-5 flex flex-col gap-3 border-b border-theme pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="section-label">Configuration</p>
              <h3 class="mt-3 section-title">Form details</h3>
              <p class="mt-1 text-sm text-muted">Define the basic metadata before publishing or collecting responses.</p>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <label>
              <span class="field-label">Form name</span>
              <input v-model="form.name" type="text" class="input-field" />
            </label>

            <label>
              <span class="field-label">Slug</span>
              <input v-model="form.slug" type="text" class="input-field" />
            </label>
          </div>

          <label class="mt-4 block">
            <span class="field-label">Description</span>
            <textarea v-model="form.description" rows="3" class="textarea-field"></textarea>
          </label>
        </section>

        <FormBuilderCanvas :model-value="fields" @remove="removeField" />
      </div>
    </div>
  </FeaturePageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import FormBuilderCanvas from '../components/FormBuilderCanvas.vue'
import FormFieldsPalette from '../components/FormFieldsPalette.vue'
import { createFormsService } from '../services/formsService.js'
import { FIELD_LIBRARY } from '../utils/formDefaults.js'

const route = useRoute()
const router = useRouter()
const formsService = createFormsService()
const form = ref({ name: '', slug: '', description: '', status: 'draft' })
const fields = ref([])
const fieldLibrary = FIELD_LIBRARY

const pageTitle = computed(() => route.params.formId ? 'Edit form' : 'Create form')

onMounted(async () => {
  if (!route.params.formId) return
  const loaded = await formsService.getFormById(route.params.formId)
  if (loaded) {
    form.value = { ...loaded }
    fields.value = await formsService.listFields(route.params.formId)
  }
})

function addField(template) {
  fields.value.push({
    id: undefined,
    label: template.label,
    key: template.label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    type: template.type,
    placeholder: '',
    isRequired: false,
    config: template.config || {},
    options: template.options || [],
    order: fields.value.length,
  })
}

function removeField(index) {
  fields.value.splice(index, 1)
  fields.value = fields.value.map((field, fieldIndex) => ({ ...field, order: fieldIndex }))
}

async function save() {
  let saved = null
  if (route.params.formId) {
    saved = await formsService.updateForm(route.params.formId, { ...form.value, fieldsCount: fields.value.length })
  } else {
    saved = await formsService.createForm({ ...form.value, fields })
  }

  if (saved?.id) {
    for (const [index, field] of fields.value.entries()) {
      await formsService.saveField(saved.id, { ...field, order: index })
    }
    router.push(`/admin/forms/${saved.id}/submissions`)
  }
}
</script>
