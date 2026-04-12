<template>
  <div class="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-5">
    <label class="space-y-2 xl:col-span-2">
      <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search</span>
      <input
        :value="modelValue.search"
        type="text"
        placeholder="Search order number, customer, notes..."
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        @input="updateField('search', $event.target.value)"
      >
    </label>

    <label class="space-y-2">
      <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span>
      <select
        :value="modelValue.status"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        @change="updateField('status', $event.target.value)"
      >
        <option value="">All statuses</option>
        <option v-for="status in orderStatuses" :key="status" :value="status">{{ status }}</option>
      </select>
    </label>

    <label class="space-y-2">
      <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Payment</span>
      <select
        :value="modelValue.paymentStatus"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        @change="updateField('paymentStatus', $event.target.value)"
      >
        <option value="">All payments</option>
        <option v-for="status in paymentStatuses" :key="status" :value="status">{{ status }}</option>
      </select>
    </label>

    <label class="space-y-2">
      <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">From</span>
      <input
        :value="modelValue.startDate"
        type="date"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        @input="updateField('startDate', $event.target.value)"
      >
    </label>

    <label class="space-y-2">
      <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">To</span>
      <input
        :value="modelValue.endDate"
        type="date"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        @input="updateField('endDate', $event.target.value)"
      >
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      search: '',
      status: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
    }),
  },
})

const emit = defineEmits(['update:modelValue'])

const orderStatuses = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded', 'partial']

function updateField(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>
