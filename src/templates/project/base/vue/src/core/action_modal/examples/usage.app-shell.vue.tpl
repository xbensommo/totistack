<template>
  <RouterView />
  <ConfirmModal />
</template>

<script setup>
/**
 * @file src/examples/usage.app-shell.vue
 * @description Example of mounting the shared modal once in the root shell.
 */

import ConfirmModal from '../core/ui/modals/ConfirmModal.vue';
</script>
