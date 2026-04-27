<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

function update(name, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [name]: value,
  })
}
</script>

<template>
  <section class="grid gap-3 rounded-2xl border p-4 md:grid-cols-5">
    <input
      :value="modelValue.search || ''"
      class="input-base md:col-span-2"
      placeholder="Search notifications"
      type="text"
      @input="update('search', $event.target.value)"
    />

    <select :value="modelValue.type || ''" class="input-base" @change="update('type', $event.target.value)">
      <option value="">All types</option>
      <option value="system">System</option>
      <option value="crm">CRM</option>
      <option value="booking">Booking</option>
      <option value="forms">Forms</option>
      <option value="auth">Auth</option>
      <option value="finance">Finance</option>
      <option value="documents">Documents</option>
    </select>

    <select :value="modelValue.channel || ''" class="input-base" @change="update('channel', $event.target.value)">
      <option value="">All channels</option>
      <option value="in_app">In-app</option>
      <option value="email">Email</option>
      <option value="whatsapp">WhatsApp</option>
    </select>

    <label class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium">
      <input
        :checked="modelValue.unreadOnly || false"
        type="checkbox"
        @change="update('unreadOnly', $event.target.checked)"
      />
      Unread only
    </label>
  </section>
</template>

<style scoped>
section {
  background: var(--color-surface, #ffffff);
  border-color: var(--color-border, #e5e7eb);
}

.input-base {
  min-height: 2.75rem;
  width: 100%;
  border-radius: 0.9rem;
  border: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-surface-muted, #f8fafc);
  padding: 0.7rem 0.85rem;
  color: var(--color-text, #111827);
}
</style>
