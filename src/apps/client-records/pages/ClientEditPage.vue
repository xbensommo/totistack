<template>
  <EntityPageShell
    eyebrow="Client Records"
    title="Edit Client"
    description="Focused edit page that reuses the same starter shape and stays easy to extend."
  >
    <EntitySectionCard title="Client Profile" description="Update basic client information.">
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
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
          <span>Status</span>
          <select v-model="form.status" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900">
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </label>

        <label class="space-y-2 text-sm text-slate-600">
          <span>Lifecycle Stage</span>
          <select v-model="form.lifecycleStage" class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900">
            <option value="lead">Lead</option>
            <option value="opportunity">Opportunity</option>
            <option value="customer">Customer</option>
            <option value="advocate">Advocate</option>
            <option value="churned">Churned</option>
          </select>
        </label>

        <div class="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            class="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            :disabled="submitting"
          >
            {{ submitting ? 'Saving...' : 'Save Changes' }}
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
 * @file ClientEditPage.vue
 * @description Starter edit page for client records.
 */

import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import EntityPageShell from '../components/EntityPageShell.vue'
import EntitySectionCard from '../components/EntitySectionCard.vue'
import { createClientService } from '../services/clientService.js'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const clientService = createClientService({ store })

const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  companyName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: 'lead',
  lifecycleStage: 'lead',
})

onMounted(async () => {
  const client = await clientService.getClient(String(route.params.id || ''))
  if (!client) return

  form.companyName = client.companyName || ''
  form.firstName = client.firstName || ''
  form.lastName = client.lastName || ''
  form.email = client.email || ''
  form.phone = client.phone || ''
  form.status = client.status || 'lead'
  form.lifecycleStage = client.lifecycleStage || 'lead'
})

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    await clientService.updateClient(String(route.params.id || ''), form)
    await router.push(`/clients/${route.params.id}`)
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to update client.'
  } finally {
    submitting.value = false
  }
}
</script>
