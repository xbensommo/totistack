<template>
  <PortalPageShell
    eyebrow="Portal"
    title="Portal overview"
    description="A controlled external-user view of records, documents, billing, and support activity."
  >
    <template #actions>
      <button
        type="button"
        class="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        @click="runQuickAction('requestSupport')"
      >
        Request support
      </button>
    </template>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <PortalSummaryCard label="Memberships" :value="dashboard?.counts?.memberships || 0" hint="Access links" />
      <PortalSummaryCard label="Records" :value="dashboard?.counts?.records || 0" hint="Visible work items" />
      <PortalSummaryCard label="Documents" :value="dashboard?.counts?.documents || 0" hint="Shared files" />
      <PortalSummaryCard label="Billing" :value="dashboard?.counts?.billing || 0" hint="Invoices or transactions" />
      <PortalSummaryCard label="Support" :value="dashboard?.counts?.tickets || 0" hint="Open requests" />
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <PortalActionCard
        title="Need help now?"
        description="Create a support request without exposing internal records or workflows."
        action-label="Create request"
        @run="runQuickAction('requestSupport')"
      />
      <PortalActionCard
        title="Refresh workspace"
        description="Reload linked records, documents, tickets, and billing summaries from the root store."
        action-label="Refresh"
        @run="refreshWorkspace"
      />
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-base font-semibold text-slate-950">Visible memberships</h2>
        <ul v-if="memberships.length" class="mt-4 space-y-3">
          <li
            v-for="membership in memberships"
            :key="membership.id || membership.linkedRecordId || membership.portalAccountId"
            class="rounded-xl border border-slate-100 px-4 py-3"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-slate-950">
                  {{ membership.linkedRecordType || 'Linked record' }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ membership.membershipRole }} · {{ membership.status }}
                </p>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {{ membership.visibilityScope || 'self' }}
              </span>
            </div>
          </li>
        </ul>
        <PortalEmptyState
          v-else
          title="No memberships yet"
          description="Portal access becomes useful only after linking the external user to a client, student, or order record."
        />
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-base font-semibold text-slate-950">Profile context</h2>
        <dl class="mt-4 space-y-3 text-sm text-slate-600">
          <div class="flex items-center justify-between gap-4">
            <dt>Profile</dt>
            <dd class="font-medium text-slate-950">{{ workspace?.profile?.name || 'Generic Portal' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt>Audience</dt>
            <dd class="font-medium text-slate-950">{{ workspace?.profile?.audienceLabel || 'Portal User' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt>Account status</dt>
            <dd class="font-medium text-slate-950">{{ workspace?.account?.status || 'unknown' }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </PortalPageShell>
</template>

<script setup>
import { onMounted } from 'vue'
import PortalActionCard from '../components/PortalActionCard.vue'
import PortalEmptyState from '../components/PortalEmptyState.vue'
import PortalPageShell from '../components/PortalPageShell.vue'
import PortalSummaryCard from '../components/PortalSummaryCard.vue'
import { usePortal } from '../composables/usePortal.js'

const { bootstrap, refreshWorkspace, runAction, dashboard, memberships, workspace } = usePortal()

async function runQuickAction(actionKey) {
  await runAction(actionKey, {
    subject: 'Portal support request',
    message: 'Please help me with my portal request.',
  })
}

onMounted(() => {
  bootstrap().catch(() => {})
})
</script>
