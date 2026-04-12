<template>
  <FeaturePageShell eyebrow="Integrations" :title="integration?.name || 'Integration detail'" description="Manage provider configuration, credentials metadata, webhook endpoints, and health checks.">
    <template #actions>
      <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="runTest">Test connection</button>
      <button type="button" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800" @click="save">Save changes</button>
    </template>

    <div class="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <section class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 text-sm font-medium text-slate-700">
              <span>Name</span>
              <input v-model="form.name" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label class="space-y-2 text-sm font-medium text-slate-700">
              <span>Environment</span>
              <select v-model="form.environment" class="w-full rounded-xl border border-slate-200 px-3 py-2">
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
            </label>
          </div>
        </section>
        <CredentialsForm :model="form.credentials" :fields="credentialFields" />
      </section>
      <section class="space-y-6">
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900">Health</h3>
          <p class="mt-2 text-sm text-slate-600">{{ healthMessage }}</p>
        </article>
        <WebhookEventsTable :items="logs" />
      </section>
    </div>
  </FeaturePageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import CredentialsForm from '../components/CredentialsForm.vue'
import WebhookEventsTable from '../components/WebhookEventsTable.vue'
import { createIntegrationsService } from '../services/integrationService.js'

const route = useRoute()
const integrationsService = createIntegrationsService()
const integration = ref(null)
const logs = ref([])
const form = reactive({ name: '', environment: 'sandbox', credentials: {} })
const credentialFields = [
  { key: 'apiKey', label: 'API key', secret: true },
  { key: 'secretKey', label: 'Secret key', secret: true },
]
const healthMessage = computed(() => integration.value?.health?.message || 'No connection check has been run yet.')

onMounted(async () => {
  integration.value = await integrationsService.getIntegrationById(route.params.integrationId)
  if (integration.value) {
    form.name = integration.value.name || ''
    form.environment = integration.value.environment || 'sandbox'
    form.credentials = { ...(integration.value.credentials || {}) }
  }
  logs.value = (await integrationsService.listLogs()).filter((item) => item.integrationId === route.params.integrationId)
})

async function save() {
  integration.value = await integrationsService.saveIntegration({
    ...integration.value,
    id: route.params.integrationId,
    name: form.name,
    environment: form.environment,
    credentials: form.credentials,
  })
}

async function runTest() {
  const result = await integrationsService.testConnection(route.params.integrationId)
  integration.value = {
    ...(integration.value || {}),
    health: result,
  }
  logs.value = (await integrationsService.listLogs()).filter((item) => item.integrationId === route.params.integrationId)
}
</script>
