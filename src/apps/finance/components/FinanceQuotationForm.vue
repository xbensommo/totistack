<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-4">
      <form
        class="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
        @submit.prevent="submit"
      >
        <div class="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary,#1860A8)]">
              Client estimate
            </p>

            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
              Create quotation
            </h2>

            <p class="mt-2 text-sm leading-7 text-[var(--color-text-light,#64748B)]">
              Create a quotation using a manual client or an existing client record.
            </p>
          </div>

          <button
            type="button"
            class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-5 py-3 text-sm font-semibold"
            :disabled="isSubmitting"
            @click="$emit('cancel')"
          >
            Close
          </button>
        </div>

        <div class="grid gap-5">
          <section class="grid gap-4 rounded-[24px] bg-[var(--color-neutral,#F8FAFC)] p-5">
            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-2xl px-4 py-2 text-sm font-semibold"
                :class="clientMode === 'manual' ? 'bg-[var(--color-accent,#000000)] text-white' : 'border border-[var(--color-neutral-dark,#E2E8F0)] text-[var(--color-text,#0F172A)]'"
                @click="setClientMode('manual')"
              >
                Manual client
              </button>

              <button
                type="button"
                class="rounded-2xl px-4 py-2 text-sm font-semibold"
                :class="clientMode === 'existing' ? 'bg-[var(--color-accent,#000000)] text-white' : 'border border-[var(--color-neutral-dark,#E2E8F0)] text-[var(--color-text,#0F172A)]'"
                @click="setClientMode('existing')"
              >
                Existing client
              </button>
            </div>

            <div v-if="clientMode === 'manual'" class="grid gap-4 md:grid-cols-2">
              <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
                Client name
                <input
                  v-model.trim="manualClient.name"
                  required
                  class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                  placeholder="Client name"
                >
              </label>

              <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
                Client number / reference
                <input
                  v-model.trim="manualClient.number"
                  class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                  placeholder="Optional"
                >
              </label>

              <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
                Client email
                <input
                  v-model.trim="manualClient.email"
                  type="email"
                  class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                  placeholder="client@email.com"
                >
              </label>

              <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
                Client phone
                <input
                  v-model.trim="manualClient.phone"
                  class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                  placeholder="+264..."
                >
              </label>
            </div>

            <div v-else class="grid gap-4 md:grid-cols-2">
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
                  :disabled="isLoadingClients || !canLoadMoreClients"
                  class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-2 text-sm font-semibold text-[var(--color-text,#0F172A)] disabled:cursor-not-allowed disabled:opacity-50"
                  @click="$emit('load-more-clients')"
                >
                  {{ isLoadingClients ? 'Loading clients...' : 'Load more clients' }}
                </button>
              </label>

              <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
                Engagement

                <select
                  v-model="selectedEngagementId"
                  :disabled="!selectedClientId || isLoadingEngagements"
                  class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)] disabled:opacity-60"
                  @change="handleEngagementChange"
                >
                  <option value="">
                    {{ selectedClientId ? 'No engagement / select one' : 'Select client first' }}
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
            </div>
          </section>

          <section class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
              Quotation code
              <input
                v-model.trim="form.quoteCode"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                placeholder="Leave blank to auto-generate if your store supports it"
              >
            </label>

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
              Status
              <select
                v-model="form.status"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
              </select>
            </label>

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
              Quote date
              <input
                v-model="form.quoteDate"
                type="date"
                required
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
              >
            </label>

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
              Valid until
              <input
                v-model="form.validUntil"
                type="date"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
              >
            </label>

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
              Reference label
              <input
                v-model.trim="form.referenceLabel"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                placeholder="Project / Engagement / Service"
              >
            </label>

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
              Reference value
              <input
                v-model.trim="form.referenceValue"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                placeholder="Website development, academic service, etc."
              >
            </label>
          </section>

          <section class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)] md:col-span-2">
              Description
              <input
                v-model.trim="line.description"
                required
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                placeholder="Service / product / project description"
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

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
              Discount
              <input
                v-model.number="form.discountAmount"
                type="number"
                min="0"
                step="0.01"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
              >
            </label>

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
              Deposit required
              <input
                v-model.number="form.depositAmount"
                type="number"
                min="0"
                step="0.01"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
              >
            </label>

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)]">
              Currency
              <select
                v-model="form.currency"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
              >
                <option value="NAD">NAD</option>
                <option value="ZAR">ZAR</option>
                <option value="USD">USD</option>
              </select>
            </label>

            <div class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] bg-[var(--color-neutral,#F8FAFC)] p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-light,#64748B)]">
                Estimated total
              </p>
              <p class="mt-2 text-xl font-semibold text-[var(--color-text,#0F172A)]">
                {{ estimatedTotalText }}
              </p>
            </div>

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)] md:col-span-2">
              Notes
              <textarea
                v-model.trim="form.notes"
                rows="3"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                placeholder="Optional quotation notes"
              />
            </label>

            <label class="grid gap-2 text-sm font-semibold text-[var(--color-text,#0F172A)] md:col-span-2">
              Terms
              <textarea
                v-model.trim="termsText"
                rows="3"
                class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-3 text-sm font-normal outline-none focus:border-[var(--color-primary,#1860A8)]"
                placeholder="One term per line"
              />
            </label>
          </section>
        </div>

        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            class="rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-5 py-3 text-sm font-semibold"
            :disabled="isSubmitting"
            @click="$emit('cancel')"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="rounded-2xl bg-[var(--color-accent,#000000)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Create quotation' }}
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

const clientMode = ref('manual')
const selectedClientId = ref('')
const selectedEngagementId = ref('')
const termsText = ref('')

const manualClient = reactive({
  name: '',
  number: '',
  email: '',
  phone: '',
})

const form = reactive({
  quoteCode: '',
  status: 'draft',
  quoteDate: today,
  validUntil: '',
  clientId: '',
  clientNumber: '',
  clientLabel: '',
  clientEmail: '',
  clientPhone: '',
  engagementId: '',
  engagementCode: '',
  referenceLabel: 'Project',
  referenceValue: '',
  discountAmount: 0,
  depositAmount: 0,
  currency: 'NAD',
  notes: '',
})

const line = reactive({
  description: '',
  quantity: 1,
  unitPrice: 0,
})

const lineTotal = computed(() => {
  return Number(line.quantity || 0) * Number(line.unitPrice || 0)
})

const estimatedTotal = computed(() => {
  return Math.max(lineTotal.value - Number(form.discountAmount || 0), 0)
})

const estimatedTotalText = computed(() => {
  return new Intl.NumberFormat('en-NA', {
    style: 'currency',
    currency: form.currency || 'NAD',
    minimumFractionDigits: 2,
  }).format(estimatedTotal.value)
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

function setClientMode(mode) {
  clientMode.value = mode

  selectedClientId.value = ''
  selectedEngagementId.value = ''

  form.clientId = ''
  form.clientNumber = ''
  form.clientLabel = ''
  form.clientEmail = ''
  form.clientPhone = ''
  form.engagementId = ''
  form.engagementCode = ''

  if (mode === 'manual') {
    form.referenceLabel = 'Project'
  }
}

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
  form.referenceLabel = 'Engagement'
  form.referenceValue = ''

  emit('select-client', form.clientId)
}

function handleEngagementChange() {
  const engagement = filteredEngagements.value.find((item) => item.id === selectedEngagementId.value)

  form.engagementId = engagement?.id || ''
  form.engagementCode = engagement?.engagementCode || ''
  form.referenceLabel = 'Engagement'
  form.referenceValue = engagement?.engagementCode || engagement?.title || ''
}

function toIsoDate(value) {
  return value ? `${value}T00:00:00.000Z` : null
}

function buildClientPayload() {
  if (clientMode.value === 'existing') {
    return {
      name: form.clientLabel,
      number: form.clientNumber || form.clientId,
      email: form.clientEmail,
      phone: form.clientPhone,
    }
  }

  return {
    name: manualClient.name,
    number: manualClient.number,
    email: manualClient.email,
    phone: manualClient.phone,
  }
}

function termsList() {
  return termsText.value
    .split('\n')
    .map((term) => term.trim())
    .filter(Boolean)
}

function submit() {
  const client = buildClientPayload()

  emit('submit', {
    quoteCode: form.quoteCode,
    quotationCode: form.quoteCode,
    status: form.status,
    quoteDate: toIsoDate(form.quoteDate),
    validUntil: toIsoDate(form.validUntil),

    client,

    clientId: form.clientId,
    clientNumber: form.clientNumber,
    clientLabel: client.name,
    clientEmail: client.email,
    clientPhone: client.phone,

    engagementId: form.engagementId,
    engagementCode: form.engagementCode,

    reference: {
      label: form.referenceLabel || 'Project',
      value: form.referenceValue || form.engagementCode || line.description,
    },

    lineItems: [
      {
        description: line.description,
        quantity: Number(line.quantity || 1),
        unitPrice: Number(line.unitPrice || 0),
      },
    ],

    discountAmount: Number(form.discountAmount || 0),
    depositAmount: Number(form.depositAmount || 0),
    totalAmount: estimatedTotal.value,
    currency: form.currency || 'NAD',
    notes: form.notes,
    terms: termsList(),
    showAcceptance: true,
  })
}
</script>