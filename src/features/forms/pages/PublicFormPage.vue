<template>
  <section class="container-premium py-8 md:py-12">
    <div class="mx-auto max-w-3xl space-y-6">
      <header class="hero-panel">
        <p class="section-label">Public form</p>
        <h1 class="mt-4 display-section text-3xl md:text-5xl">{{ form?.name || 'Form' }}</h1>
        <p class="mt-3 text-lead text-base md:text-lg">{{ form?.description }}</p>
      </header>

      <form v-if="form" class="form-shell max-w-none" @submit.prevent="handleSubmit">
        <div class="space-y-5">
          <div v-for="field in fields" :key="field.id" class="form-section space-y-3">
            <label class="field-label">{{ field.label }}</label>

            <input
              v-if="field.type !== 'textarea'"
              v-model="payload[field.key]"
              :type="field.type === 'email' ? 'email' : 'text'"
              class="input-field"
              :placeholder="field.placeholder || `Enter ${field.label}`"
              :required="field.isRequired"
            />

            <textarea
              v-else
              v-model="payload[field.key]"
              rows="4"
              class="textarea-field"
              :placeholder="field.placeholder || `Enter ${field.label}`"
              :required="field.isRequired"
            ></textarea>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" class="btn-primary btn-lg">
            <i class="fas fa-paper-plane text-xs"></i>
            {{ form.settings?.submitButtonText || 'Submit' }}
          </button>

          <p v-if="submitted" class="alert alert-success flex-1">
            <i class="fas fa-circle-check mt-0.5"></i>
            <span>{{ form.settings?.successMessage || 'Submitted successfully.' }}</span>
          </p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { createFormsService } from '../services/formsService.js'

const route = useRoute()
const formsService = createFormsService()
const form = ref(null)
const fields = ref([])
const payload = reactive({})
const submitted = ref(false)

onMounted(async () => {
  form.value = await formsService.getFormBySlug(route.params.slug)
  if (form.value?.id) {
    fields.value = await formsService.listFields(form.value.id)
  }
})

async function handleSubmit() {
  if (!form.value) return
  await formsService.submitForm(form.value, { ...payload })
  submitted.value = true
}
</script>
