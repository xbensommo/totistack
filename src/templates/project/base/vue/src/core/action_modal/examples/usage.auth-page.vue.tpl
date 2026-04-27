<template>
  <button
    type="button"
    class="rounded-2xl bg-[var(--color-primary,#1860A8)] px-4 py-2 text-white"
    @click="handleRoleChange"
  >
    Change Role
  </button>
</template>

<script setup>
/**
 * @file src/examples/usage.auth-page.vue
 * @description Example usage from an auth/admin page.
 */

import { useActionExecutor } from '@core/composables/use-action-executor.js';
import { useAuthService } from '@/features/auth/services/use-auth-service.js';
import { useToast } from 'vue-sonner';

const actions = useActionExecutor();
const auth = useAuthService();
const toast = useToast();

const user = {
  id: 'u_123',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
};

async function handleRoleChange() {
  await actions.execute({
    type: 'auth.user.change-role',
    target: user,
    payload: { nextRole: 'admin' },
    services: {
      auth,
      toast,
    },
  });
}
</script>
