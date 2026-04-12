<template>
  <FeaturePageShell eyebrow="Integrations" title="Connected systems" description="Track connection health, credentials, and delivery status across your project integrations.">
    <div v-if="integrations.length" class="grid gap-4 xl:grid-cols-2">
      <IntegrationCard v-for="integration in integrations" :key="integration.id" :integration="integration">
        <template #actions>
          <RouterLink :to="`/admin/integrations/${integration.id}`" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open</RouterLink>
        </template>
      </IntegrationCard>
    </div>
    <EmptyState v-else title="No integrations configured" description="Add providers such as Stripe, SendGrid, Slack, or OpenAI and then plug them into workflows or forms." />
  </FeaturePageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import EmptyState from '../components/EmptyState.vue'
import IntegrationCard from '../components/IntegrationCard.vue'
import { createIntegrationsService } from '../services/integrationService.js'

const integrationsService = createIntegrationsService()
const integrations = ref([])

onMounted(async () => {
  integrations.value = await integrationsService.listIntegrations()
})
</script>
