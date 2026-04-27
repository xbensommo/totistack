<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      enabled: true,
      channels: ['in_app', 'email', 'whatsapp'],
      quietHours: { enabled: false, start: '22:00', end: '06:00' },
    }),
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = reactive(structuredClone(props.modelValue))

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(form, structuredClone(value || {}))
  },
  { deep: true },
)

function toggleChannel(channel) {
  const current = new Set(form.channels || [])
  if (current.has(channel)) current.delete(channel)
  else current.add(channel)
  form.channels = [...current]
  emit('update:modelValue', structuredClone(form))
}

function updateField(path, value) {
  const parts = path.split('.')
  let target = form

  while (parts.length > 1) {
    const key = parts.shift()
    target[key] ||= {}
    target = target[key]
  }

  target[parts[0]] = value
  emit('update:modelValue', structuredClone(form))
}

function submitForm() {
  emit('submit', structuredClone(form))
}
</script>

<template>
  <form class="space-y-6 rounded-2xl border p-5" @submit.prevent="submitForm">
    <div class="space-y-3">
      <h3 class="text-base font-semibold">General</h3>

      <label class="preference-row">
        <span>Enable notifications</span>
        <input
          :checked="form.enabled"
          type="checkbox"
          @change="updateField('enabled', $event.target.checked)"
        />
      </label>
    </div>

    <div class="space-y-3">
      <h3 class="text-base font-semibold">Channels</h3>

      <div class="grid gap-3 sm:grid-cols-3">
        <button
          v-for="channel in ['in_app', 'email', 'whatsapp']"
          :key="channel"
          :class="['channel-chip', (form.channels || []).includes(channel) ? 'channel-chip-active' : '']"
          type="button"
          @click="toggleChannel(channel)"
        >
          {{ channel }}
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-base font-semibold">Quiet hours</h3>

      <label class="preference-row">
        <span>Use quiet hours</span>
        <input
          :checked="form.quietHours?.enabled"
          type="checkbox"
          @change="updateField('quietHours.enabled', $event.target.checked)"
        />
      </label>

      <div class="grid gap-3 sm:grid-cols-2">
        <input
          :value="form.quietHours?.start || ''"
          class="input-base"
          type="time"
          @input="updateField('quietHours.start', $event.target.value)"
        />
        <input
          :value="form.quietHours?.end || ''"
          class="input-base"
          type="time"
          @input="updateField('quietHours.end', $event.target.value)"
        />
      </div>
    </div>

    <div class="flex justify-end">
      <button class="save-btn" type="submit">Save preferences</button>
    </div>
  </form>
</template>

<style scoped>
form {
  background: var(--color-surface, #ffffff);
  border-color: var(--color-border, #e5e7eb);
}

.preference-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 1rem;
  padding: 0.85rem 1rem;
}

.channel-chip {
  border-radius: 999px;
  border: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-surface-muted, #f8fafc);
  padding: 0.8rem 1rem;
  text-transform: capitalize;
}

.channel-chip-active {
  color: white;
  border-color: transparent;
  background: var(--color-primary, #1860a8);
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

.save-btn {
  border-radius: 999px;
  border: 0;
  background: var(--color-primary, #1860a8);
  color: white;
  padding: 0.8rem 1.1rem;
  font-weight: 600;
}
</style>
