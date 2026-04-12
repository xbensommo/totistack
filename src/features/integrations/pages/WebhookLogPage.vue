<template>
  <FeaturePageShell eyebrow="Integrations" title="Integration diagnostics" description="Review webhook and provider events to troubleshoot connection issues quickly.">
    <WebhookEventsTable v-if="logs.length" :items="logs" />
    <EmptyState v-else title="No logs yet" description="Connection tests, webhook calls, and provider events will appear here." />
  </FeaturePageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import EmptyState from '../components/EmptyState.vue'
import WebhookEventsTable from '../components/WebhookEventsTable.vue'
import { createIntegrationsService } from '../services/integrationService.js'

const integrationsService = createIntegrationsService()
const logs = ref([])

onMounted(async () => {
  logs.value = await integrationsService.listLogs()
})
</script>
