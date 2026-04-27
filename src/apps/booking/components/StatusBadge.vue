<template>
  <span :class="badgeClass" class="badge capitalize">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'pending',
  },
})

const map = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  checked_in: 'badge-primary',
  completed: '',
  cancelled: 'badge-danger',
  no_show: 'badge-danger',
  rescheduled: 'badge-primary',
}

const label = computed(() => props.status.replace(/_/g, ' '))
const badgeClass = computed(() => map[props.status] || '')
</script>
