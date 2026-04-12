<template>
  <EntityPageShell
    eyebrow="Client Records"
    title="Create Client"
    description="Starter create form that is intentionally small, readable, and easy to extend."
  >
    <EntitySectionCard title="Client Profile" description="Basic profile information for the new client.">
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <label class="space-y-2 text-sm text-slate-600">
          <span>Client Type</span>
          <select v-model="form.type" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900">
            <option value="individual">Individual</option>
            <option value="business">Business</option>
            <option value="nonprofit">Nonprofit</option>
            <option value="government">Government</option>
          </select>
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>Status</span>
          <select v-model="form.status" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900">
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <label class="space-y-2 text-sm text-slate-600 md:col-span-2">
          <span>Company Name</span>
          <input v-model="form.companyName" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900" />
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>First Name</span>
          <input v-model="form.firstName" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900" />
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>Last Name</span>
          <input v-model="form.lastName" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900" />
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>Email</span>
          <input v-model="form.email" type="email" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900" />
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>Phone</span>
          <input v-model="form.phone" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900" />
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>Lead Source</span>
          <input v-model="form.leadSource" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900" />
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>Primary Contact Email</span>
          <input v-model="form.primaryContact.email" type="email" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900" />
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>Primary Contact First Name</span>
          <input v-model="form.primaryContact.firstName" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900" />
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>Primary Contact Last Name</span>
          <input v-model="form.primaryContact.lastName" type="text" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900" />
        </label>

        <div class="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            class="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            :disabled="submitting"
          >
            {{ submitting ? 'Saving...' : 'Create Client' }}
          </button>
          <p v-if="errorMessage" class="text-sm text-rose-600">
            {{ errorMessage }}
          </p>
        </div>
      </form>
    </EntitySectionCard>
  </EntityPageShell>
</template>

<script setup>
/**
 * @file ClientCreatePage.vue
 * @description Starter create page for client records.
 */

import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import EntityPageShell from '../components/EntityPageShell.vue'
import EntitySectionCard from '../components/EntitySectionCard.vue'
import { createClientService } from '../services/clientService.js'

const router = useRouter()
const store = useAppStore()
const clientService = createClientService({ store })

const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  type: 'individual',
  companyName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: 'lead',
  lifecycleStage: 'lead',
  leadSource: '',
  primaryContact: {
    email: '',
    firstName: '',
    lastName: '',
  },
})

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    const created = await clientService.createClient(form)
    if (created?.id) {
      await router.push(`/clients/${created.id}`)
    } else {
      await router.push('/clients')
    }
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to create client.'
  } finally {
    submitting.value = false
  }
}
</script>
