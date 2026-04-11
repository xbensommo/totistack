<template>
  <AuthCard title="Reset password" description="Enter your email and we will send you a reset link.">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <AuthField v-model="email" label="Email address" type="email" autocomplete="email" :error="error" />
      <button
        type="submit"
        class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        :disabled="loading"
      >
        {{ loading ? 'Sending link...' : 'Send reset link' }}
      </button>
      <RouterLink class="inline-flex text-sm font-medium text-slate-700 hover:text-slate-900" to="/auth">
        Back to sign in
      </RouterLink>
    </form>
  </AuthCard>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { toast } from 'vue-sonner';
import { useAppStore } from '@app/stores/appStore/index.js';
import AuthCard from '../components/AuthCard.vue';
import AuthField from '../components/AuthField.vue';

const store = useAppStore();
const email = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  if (!email.value) {
    error.value = 'Email is required.';
    return;
  }

  loading.value = true;
  try {
    await store.sendPasswordReset(email.value);
    toast.success('Password reset link sent.');
  } catch (err) {
    toast.error('Unable to send reset link.', {
      description: err?.message || 'Please try again later.',
    });
  } finally {
    loading.value = false;
  }
}
</script>
