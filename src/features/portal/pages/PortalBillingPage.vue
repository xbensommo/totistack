<template>
  <PortalPageShell
    eyebrow="Portal"
    title="Billing"
    description="The portal should read payment and invoice context without replacing the finance ledger."
  >
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-base font-semibold text-slate-950">Billing items</h2>
        <button
          type="button"
          class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
          @click="askBillingQuestion"
        >
          Ask billing question
        </button>
      </div>

      <div v-if="workspace?.billing?.length" class="mt-4 overflow-hidden rounded-2xl border border-slate-100">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-4 py-3 font-medium">Reference</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="entry in workspace.billing" :key="entry.id || entry.sourceId || entry.referenceNumber">
              <td class="px-4 py-3 text-slate-950">
                {{ entry.referenceNumber || entry.title || entry.sourceId || 'Billing item' }}
              </td>
              <td class="px-4 py-3 text-slate-600">{{ entry.status || entry.financeStatus || 'open' }}</td>
              <td class="px-4 py-3 text-slate-600">{{ entry.amount || entry.totalAmount || entry.balanceAmount || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <PortalEmptyState
        v-else
        title="No billing items"
        description="Billing appears here when the finance module links transactions or invoices back to the portal membership context."
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

async function askBillingQuestion() {
  await runAction('requestBillingHelp', {
    message: 'I need clarification on a billing item shown in my portal.',
  })
}

onMounted(() => {
  bootstrap().catch(() => {})
})
</script>
