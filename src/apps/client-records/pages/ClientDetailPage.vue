<template>
  <EntityPageShell
    eyebrow="Client Records"
    :title="headline"
    description="Review profile details, contacts, notes, and the recent timeline for this client."
  >
    <template #actions>
      <RouterLink
        :to="`/clients/${route.params.id}/edit`"
        class="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
      >
        Edit Client
      </RouterLink>
    </template>

    <div v-if="client" class="grid gap-6 xl:grid-cols-[320px,1fr]">
      <ClientSummaryPanel :client="client" />

      <div class="space-y-6">
        <EntitySectionCard title="Primary Contact" description="Main contact details used by the business and support teams.">
          <div v-if="client.primaryContact" class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-slate-900">
                {{ client.primaryContact.firstName }} {{ client.primaryContact.lastName }}
              </p>
              <p class="text-sm text-slate-600">{{ client.primaryContact.title || 'No title set' }}</p>
            </div>
            <div class="space-y-1 text-sm text-slate-600">
              <p>{{ client.primaryContact.email || 'No email' }}</p>
              <p>{{ client.primaryContact.phone || 'No phone' }}</p>
            </div>
          </div>
          <EmptyState
            v-else
            title="No primary contact yet"
            description="Add a primary contact in the edit flow or during client creation."
          />
        </EntitySectionCard>

        <EntitySectionCard title="Contacts" description="Other people associated with this client account.">
          <EntityTable :columns="contactColumns" :rows="client.contacts || []" empty-text="No contacts linked yet." />
        </EntitySectionCard>

        <EntitySectionCard title="Notes" description="Recent notes and relationship context.">
          <ul v-if="(client.notes || []).length" class="space-y-3">
            <li
              v-for="note in client.notes"
              :key="note.id"
              class="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p class="text-sm text-slate-700">{{ note.content }}</p>
              <p class="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                {{ note.type || 'general' }}
              </p>
            </li>
          </ul>
          <EmptyState
            v-else
            title="No notes yet"
            description="Use notes for onboarding context, delivery notes, and relationship history."
          />
        </EntitySectionCard>

        <EntitySectionCard title="Activity Timeline" description="Recent interactions and system updates for this client.">
          <ActivityTimeline :items="client.activities || []" />
        </EntitySectionCard>
      </div>
    </div>

    <EmptyState
      v-else
      title="Client not found"
      description="This client could not be loaded from the generated collection actions."
    >
      <RouterLink
        to="/clients"
        class="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Back to Clients
      </RouterLink>
    </EmptyState>
  </EntityPageShell>
</template>

<script setup>
/**
 * @file ClientDetailPage.vue
 * @description Starter detail page for client records.
 */

import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import ActivityTimeline from '../components/ActivityTimeline.vue'
import ClientSummaryPanel from '../components/ClientSummaryPanel.vue'
import EmptyState from '../components/EmptyState.vue'
import EntityPageShell from '../components/EntityPageShell.vue'
import EntitySectionCard from '../components/EntitySectionCard.vue'
import EntityTable from '../components/EntityTable.vue'
import { createClientService } from '../services/clientService.js'

const route = useRoute()
const store = useAppStore()
const clientService = createClientService({ store })
const client = ref(null)

const contactColumns = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
]

const headline = computed(() => {
  if (!client.value) return 'Client Detail'
  return (
    client.value.companyName ||
    [client.value.firstName, client.value.lastName].filter(Boolean).join(' ') ||
    'Client Detail'
  )
})

onMounted(async () => {
  client.value = await clientService.getClient(String(route.params.id || ''))
})
</script>
