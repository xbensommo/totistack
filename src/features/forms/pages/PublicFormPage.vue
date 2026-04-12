<template>
  <section class="mx-auto max-w-3xl space-y-6 px-4 py-10">
    <header class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Public form</p>
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900">{{ form?.name || 'Form' }}</h1>
      <p class="text-sm leading-6 text-slate-600">{{ form?.description }}</p>
    </header>

    <form v-if="form" class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" @submit.prevent="handleSubmit">
      <div v-for="field in fields" :key="field.id" class="space-y-2">
        <label class="block text-sm font-medium text-slate-700">{{ field.label }}</label>
        <input
          v-if="field.type !== 'textarea'"
          v-model="payload[field.key]"
          :type="field.type === 'email' ? 'email' : 'text'"
          class="w-full rounded-xl border border-slate-200 px-3 py-2"
          :required="field.isRequired"
        />
        <textarea v-else v-model="payload[field.key]" rows="4" class="w-full rounded-xl border border-slate-200 px-3 py-2" :required="field.isRequired"></textarea>
      </div>
      <button type="submit" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">{{ form.settings?.submitButtonText || 'Submit' }}</button>
      <p v-if="submitted" class="text-sm font-medium text-emerald-600">{{ form.settings?.successMessage || 'Submitted successfully.' }}</p>
    </form>
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
