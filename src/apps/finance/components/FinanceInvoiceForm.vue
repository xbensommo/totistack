<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-4">
      <form
        class="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
        @submit.prevent="submit"
      >
        <div class="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
              Client billing
            </p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
              Create invoice
            </h2>
            <p class="mt-2 text-sm leading-7 text-[var(--color-text-light,#64748B)]">
              Select the client and engagement before creating the invoice.
            </p>
          </div>

          <button
            type="button"
            class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-5 py-3 text-sm font-semibold"
            :disabled="props.isSubmitting"
            @click="$emit('cancel')"
          >
            Close
          </button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
            Client

            <select
              v-model="selectedClientId"
              required
              class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
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
              :disabled="props.isLoadingClients || !props.canLoadMoreClients"
              class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-2 text-sm font-semibold text-[var(--color-text,#0F172A)] disabled:cursor-not-allowed disabled:opacity-50"
              @click="$emit('load-more-clients')"
            >
              {{ props.isLoadingClients ? 'Loading clients...' : 'Load more clients' }}
            </button>
          </label>

          <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
            Engagement

            <select
              v-model="selectedEngagementId"
              required
              :disabled="!selectedClientId || props.isLoadingEngagements"
              class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)]  text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)] disabled:opacity-60"
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

          <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
            Issue date
            <input
              v-model="form.issueDate"
              type="date"
              required
              class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
            >
          </label>

          <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
            Due date
            <input
              v-model="form.dueDate"
              type="date"
              class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
            >
          </label>

          <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)] md:col-span-2">
            Description
            <input
              v-model.trim="line.description"
              required
              class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
              placeholder="Academic writing service"
            >
          </label>

          <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
            Quantity
            <input
              v-model.number="line.quantity"
              type="number"
              min="1"
              step="1"
              required
              class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
            >
          </label>

          <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
            Unit price
            <input
              v-model.number="line.unitPrice"
              type="number"
              min="0"
              step="0.01"
              required
              class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
            >
          </label>

          <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)] md:col-span-2">
            Notes
            <textarea
              v-model.trim="form.notes"
              rows="3"
              class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
              placeholder="Optional invoice notes"
            />
          </label>
        </div>

        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-5 py-3 text-sm font-semibold"
            :disabled="props.isSubmitting"
            @click="$emit('cancel')"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="rounded-2xl bg-[var(--color-accent,#000000)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="props.isSubmitting"
          >
            {{ props.isSubmitting ? 'Saving...' : 'Create invoice' }}
          </button>
        </div>
      </form>
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
  clientEmail: '',
  clientPhone: '',
  engagementId: '',
  engagementCode: '',
  issueDate: today,
  dueDate: '',
  notes: '',
})

const line = reactive({
  description: '',
  quantity: 1,
  unitPrice: 0,
})

function unwrapRecord(record) {
  const data = record?.data && typeof record.data === 'object' ? record.data : record

  return {
    id: record?.id || data?.id || record?.docId || record?._id,
    ...data,
  }
}

function buildClientLabel(client) {
  const firstName = String(client?.firstName || '').trim()
  const lastName = String(client?.lastName || '').trim()
  const fullName = String(client?.fullName || '').trim()

  return [firstName, lastName].filter(Boolean).join(' ') || fullName || 'Unnamed client'
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
  form.clientEmail = client?.email || ''
  form.clientPhone = client?.phone || ''

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

function toIsoDate(value) {
  return value ? `${value}T00:00:00.000Z` : null
}

function submit() {
  emit('submit', {
    ...form,
    issueDate: toIsoDate(form.issueDate),
    dueDate: toIsoDate(form.dueDate),
    lineItems: [{ ...line }],
    currency: 'NAD',
  })
}
</script>