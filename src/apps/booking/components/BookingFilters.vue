<template>
  <div class="card">
    <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="section-label">Filters</p>
        <h2 class="mt-3 text-lg font-semibold text-[var(--color-text)]">Refine bookings</h2>
        <p class="mt-1 text-sm text-muted">
          Search by customer, booking reference, status, date range, and payment state.
        </p>
      </div>

      <button type="button" class="btn-ghost btn-sm self-start lg:self-auto" @click="resetFilters">
        Reset filters
      </button>
    </div>

    <div class="grid gap-4 lg:grid-cols-6">
      <label class="space-y-2 lg:col-span-2">
        <span class="field-label text-xs uppercase tracking-[0.18em]">Search</span>
        <input
          :value="modelValue.search"
          type="text"
          placeholder="Booking number, service, customer..."
          class="input-field"
          @input="emitPatch({ search: $event.target.value })"
        />
      </label>

      <label class="space-y-2">
        <span class="field-label text-xs uppercase tracking-[0.18em]">Status</span>
        <select
          :value="modelValue.status"
          class="select-field"
          @change="emitPatch({ status: $event.target.value })"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked in</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No show</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
      </label>

      <label class="space-y-2">
        <span class="field-label text-xs uppercase tracking-[0.18em]">Channel</span>
        <select
          :value="modelValue.bookingChannel"
          class="select-field"
          @change="emitPatch({ bookingChannel: $event.target.value })"
        >
          <option value="">All channels</option>
          <option value="authenticated">Authenticated</option>
          <option value="public">Public</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <label class="space-y-2">
        <span class="field-label text-xs uppercase tracking-[0.18em]">Payment</span>
        <select
          :value="modelValue.paymentStatus"
          class="select-field"
          @change="emitPatch({ paymentStatus: $event.target.value })"
        >
          <option value="">All payment states</option>
          <option value="pending">Pending</option>
          <option value="deposit_due">Deposit due</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </label>

      <label class="space-y-2">
        <span class="field-label text-xs uppercase tracking-[0.18em]">From</span>
        <input
          :value="modelValue.startDate"
          type="date"
          class="input-field"
          @input="emitPatch({ startDate: $event.target.value })"
        />
      </label>

      <label class="space-y-2">
        <span class="field-label text-xs uppercase tracking-[0.18em]">To</span>
        <input
          :value="modelValue.endDate"
          type="date"
          class="input-field"
          @input="emitPatch({ endDate: $event.target.value })"
        />
      </label>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

function emitPatch(patch) {
  emit('update:modelValue', {
    ...props.modelValue,
    ...patch,
  })
}

function resetFilters() {
  emit('update:modelValue', {
    search: '',
    status: '',
    bookingChannel: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
  })
}
</script>
