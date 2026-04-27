<template>
  <button
    type="button"
    class="rounded-2xl bg-emerald-600 px-4 py-2 text-white"
    @click="handleApprove"
  >
    Approve Client
  </button>
</template>

<script setup>
/**
 * @file src/examples/usage.crm-page.vue
 * @description Example usage from a CRM page.
 */

import { useActionExecutor } from '../core/composables/use-action-executor.js';
import { useToast } from 'vue-sonner';
import { useCrmService } from '@/apps/crm/services/use-crm-service.js';

const actions = useActionExecutor();
const crm = useCrmService();
const toast = useToast();

const client = {
  id: 'client_01',
  name: 'Acme Logistics',
};

async function handleApprove() {
  await actions.execute({
    type: 'crm.client.approve',
    target: client,
    services: {
      crm,
      toast,
    },
  });
}
</script>
