<template>
  <FinanceActionPanel
    title="Post transaction"
    description="Posting is guarded by the finance action modal."
    :show-post="true"
    :confirm-action="confirmAction"
    @post="$emit('post')"
  />
</template>

<script setup>
/**
 * @file src/apps/finance/components/FinanceActionConfirmExample.vue
 * @description Compatibility wrapper around the richer finance action panel.
 */

import FinanceActionPanel from './FinanceActionPanel.vue'

defineProps({
  confirmAction: {
    type: Function,
    default: null,
  },
})

defineEmits(['post'])
</script>
