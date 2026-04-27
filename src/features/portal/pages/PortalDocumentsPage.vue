<template>
  <PortalPageShell
    eyebrow="Portal"
    title="Documents"
    description="Portal users should get only the files that belong to their membership scope."
  >
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-base font-semibold text-slate-950">Visible documents</h2>
        <button
          type="button"
          class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
          @click="requestReview"
        >
          Request review
        </button>
      </div>

      <ul v-if="workspace?.documents?.length" class="mt-4 space-y-3">
        <li
          v-for="document in workspace.documents"
          :key="document.id || document.documentNumber || document.fileName"
          class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3"
        >
          <div>
            <p class="text-sm font-medium text-slate-950">{{ document.title || document.fileName || 'Portal document' }}</p>
            <p class="text-xs text-slate-500">{{ document.status || document.type || 'available' }}</p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {{ document.documentType || document.type || 'document' }}
          </span>
        </li>
      </ul>

      <PortalEmptyState
        v-else
        title="No documents yet"
        description="Once your host modules link document visibility to portal memberships, files will appear here."
      />
    </section>
  </PortalPageShell>
</template>

<script setup>
import { onMounted } from 'vue'
import PortalEmptyState from '../components/PortalEmptyState.vue'
import PortalPageShell from '../components/PortalPageShell.vue'
import { usePortal } from '../composables/usePortal.js'

const { bootstrap, runAction, workspace } = usePortal()

async function requestReview() {
  await runAction('requestDocumentReview', {
    note: 'Please review my uploaded document when possible.',
  })
}

onMounted(() => {
  bootstrap().catch(() => {})
})
</script>
