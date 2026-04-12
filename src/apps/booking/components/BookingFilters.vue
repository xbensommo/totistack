<template>
  <div class="grid gap-4 lg:grid-cols-4">
    <label class="space-y-2">
      <span class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Search</span>
      <input
        :value="modelValue.search"
        type="text"
        placeholder="Booking number, title, customer..."
        class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
        @input="emitPatch({ search: $event.target.value })"
      />
    </label>

    <label class="space-y-2">
      <span class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Status</span>
      <select
        :value="modelValue.status"
        class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
        @change="emitPatch({ status: $event.target.value })"
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="checked_in">Checked in</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="no_show">No show</option>
      </select>
    </label>

    <label class="space-y-2">
      <span class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">From</span>
      <input
        :value="modelValue.startDate"
        type="date"
        class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
        @input="emitPatch({ startDate: $event.target.value })"
      />
    </label>

    <label class="space-y-2">
      <span class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">To</span>
      <input
        :value="modelValue.endDate"
        type="date"
        class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
        @input="emitPatch({ endDate: $event.target.value })"
      />
    </label>
  </div>
</template>

<script setup>
/**
 * Generic booking filter bar.
 */
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

/**
 * Emit a partial update while preserving the rest of the filter state.
 *
 * @param {Record<string, any>} patch
 */
function emitPatch(patch) {
  emit('update:modelValue', {
    ...props.modelValue,
    ...patch,
  })
}
</script>
