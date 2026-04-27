<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-4">
      <section class="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
              Operational action
            </p>

            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
              Log client payment
            </h2>

            <p class="mt-2 text-sm leading-7 text-[var(--color-text-light,#64748B)]">
              This creates a payment record and a draft finance transaction. Finance staff can review and post it from the transactions page.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-2 text-sm font-semibold text-[var(--color-text,#0F172A)]"
            @click="$emit('cancel')"
          >
            Close
          </button>
        </div>

        <form class="mt-6 grid gap-4 md:grid-cols-2" @submit.prevent="submitForm">
          <!-- <input
            type="search"
            placeholder="Search client by name, number, email, or phone"
            class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm"
            @input="$emit('search-clients', $event.target.value)"
          > -->
          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
              Client
            </span>

            <select
              v-model="selectedClientId"
              required
              class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm"
              @change="handleClientChange"
            >
              <option value="" disabled>Select client</option>

              <option
                v-for="client in normalizedClients"
                :key="client.id"
                :value="client.id"
              >
                {{ client.label }}
              </option>
            </select>

            <button
              type="button"
              :disabled="isLoadingClients || !canLoadMoreClients"
              class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-2 text-sm font-semibold text-[var(--color-text,#0F172A)] disabled:cursor-not-allowed disabled:opacity-50"
              @click="$emit('load-more-clients')"
            >
              {{ isLoadingClients ? 'Loading clients...' : 'Load more clients' }}
            </button>
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
              Engagement
            </span>

            <select
              v-model="selectedEngagementId"
              required
              :disabled="!selectedClientId"
              class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm disabled:opacity-60"
              @change="handleEngagementChange"
            >
              <option value="" disabled>
                {{ selectedClientId ? 'Select engagement' : 'Select client first' }}
              </option>

              <option
                v-for="engagement in filteredEngagements"
                :key="engagement.id"
                :value="engagement.id"
              >
                {{ engagement.label }}
              </option>
            </select>
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
              Amount
            </span>

            <input
              v-model.number="form.amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm"
            >
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
              Payment date
            </span>

            <input
              v-model="form.paymentDate"
              type="date"
              required
              class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm"
            >
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
              Payment method
            </span>

            <select
              v-model="form.paymentMethod"
              class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="eft">EFT</option>
              <option value="wallet">Wallet</option>
            </select>
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
              Reference
            </span>

            <input
              v-model.trim="form.referenceNumber"
              class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm"
            >
          </label>

          <label class="space-y-2 md:col-span-2">
            <span class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
              Notes
            </span>

            <textarea
              v-model.trim="form.notes"
              rows="3"
              class="w-full rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm"
            />
          </label>

          <div class="flex flex-wrap justify-end gap-3 md:col-span-2">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-2 text-sm font-semibold text-[var(--color-text,#0F172A)]"
              @click="$emit('cancel')"
            >
              Cancel
            </button>

            <button
              :disabled="isSubmitting"
              type="submit"
              class="inline-flex items-center justify-center rounded-2xl bg-[var(--color-accent,#000000)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {{ isSubmitting ? 'Saving...' : 'Log payment' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  clients: {
    type: Array,
    default: () => [],
  },
  engagements: {
    type: Array,
    default: () => [],
  },
  isLoadingClients: {
    type: Boolean,
    default: false,
  },
  isLoadingEngagements: {
    type: Boolean,
    default: false,
  },
  canLoadMoreClients: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'submit',
  'cancel',
  'select-client',
  'load-more-clients',
])
const today = new Date().toISOString().slice(0, 10)

const selectedClientId = ref('')
const selectedEngagementId = ref('')

const form = reactive({
  clientId: '',
  clientNumber: '',
  clientLabel: '',
  engagementId: '',
  engagementCode: '',
  amount: null,
  paymentDate: today,
  paymentMethod: 'bank_transfer',
  referenceNumber: '',
  notes: '',
  currency: 'NAD',
})

function unwrapRecord(record) {
  return record?.data && typeof record.data === 'object'
    ? { id: record.id || record.data.id, ...record.data }
    : record
}

function buildClientLabel(client) {
  const firstName = String(client?.firstName || '').trim()
  const lastName = String(client?.lastName || '').trim()
  const fullName = String(client?.fullName || '').trim()

  return fullName || [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed client'
}

function buildEngagementLabel(engagement) {
  return [
    engagement?.engagementCode,
    engagement?.title,
  ]
    .filter(Boolean)
    .join(' — ') || 'Unnamed engagement'
}

const normalizedClients = computed(() => {
  return props.clients
    .map(unwrapRecord)
    .filter((client) => client?.id && client?.isDeleted !== true)
    .map((client) => ({
      ...client,
      label: buildClientLabel(client),
    }))
})

const normalizedEngagements = computed(() => {
  return props.engagements
    .map(unwrapRecord)
    .filter((engagement) => engagement?.id && engagement?.isDeleted !== true)
    .map((engagement) => ({
      ...engagement,
      label: buildEngagementLabel(engagement),
    }))
})

const filteredEngagements = computed(() => {
  if (!selectedClientId.value) return []

  return normalizedEngagements.value.filter((engagement) => {
    return engagement.clientId === selectedClientId.value
  })
})

function handleClientChange() {
  const client = normalizedClients.value.find((item) => item.id === selectedClientId.value)

  form.clientId = client?.id || ''
  form.clientNumber = client?.clientNumber || ''
  form.clientLabel = client?.label || ''

  selectedEngagementId.value = ''
  form.engagementId = ''
  form.engagementCode = ''

  emit('select-client', form.clientId)
}

function handleEngagementChange() {
  const engagement = filteredEngagements.value.find((item) => item.id === selectedEngagementId.value)

  form.engagementId = engagement?.id || ''
  form.engagementCode = engagement?.engagementCode || ''
}

function submitForm() {
  emit('submit', { ...form })
}
</script>