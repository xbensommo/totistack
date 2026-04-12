<template>
  <FeaturePageShell eyebrow="Forms" title="Submission inbox" description="Review submissions, identify flagged entries, and hand off responses to downstream workflows.">
    <MetricsGrid :items="stats" />
    <SubmissionsTable v-if="submissions.length" :submissions="submissions" />
    <EmptyState v-else title="No submissions yet" description="This form has not received any submissions yet." />
  </FeaturePageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import FeaturePageShell from '../components/FeaturePageShell.vue'
import MetricsGrid from '../components/MetricsGrid.vue'
import EmptyState from '../components/EmptyState.vue'
import SubmissionsTable from '../components/SubmissionsTable.vue'
import { createFormsService } from '../services/formsService.js'

const route = useRoute()
const formsService = createFormsService()
const submissions = ref([])

const stats = computed(() => [
  { label: 'Total submissions', value: submissions.value.length, hint: 'Responses received for this form' },
  { label: 'Flagged', value: submissions.value.filter((item) => item.status === 'flagged').length, hint: 'Likely spam or high risk' },
  { label: 'Reviewed', value: submissions.value.filter((item) => item.status === 'reviewed').length, hint: 'Already triaged' },
  { label: 'New', value: submissions.value.filter((item) => item.status === 'new').length, hint: 'Awaiting action' },
])

onMounted(async () => {
  submissions.value = await formsService.listSubmissions(route.params.formId)
})
</script>
