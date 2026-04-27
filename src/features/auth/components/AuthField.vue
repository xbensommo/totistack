<template>
  <label class="block">
    <span class="field-label">{{ label }}</span>

    <div class="input-group">
      <slot name="prefix" />
      <input
        :value="modelValue"
        :type="type"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :class="[
          'input-field',
          hasPrefix ? 'pl-11' : '',
          error ? 'input-invalid' : '',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <slot name="suffix" />
    </div>

    <p v-if="error" class="field-error">{{ error }}</p>
  </label>
</template>

<script setup>
import { computed, useSlots } from 'vue';

const slots = useSlots();

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue']);

const hasPrefix = computed(() => Boolean(slots.prefix));
void props;
</script>
