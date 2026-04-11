<template>
  <AuthCard title="Choose a new password" description="Complete the password reset flow started from your email link.">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <AuthField v-model="password" label="New password" type="password" autocomplete="new-password" :error="errors.password" />
      <AuthField v-model="confirmPassword" label="Confirm password" type="password" autocomplete="new-password" :error="errors.confirmPassword" />
      <button
        type="submit"
        class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        :disabled="loading"
      >
        {{ loading ? 'Updating password...' : 'Update password' }}
      </button>
    </form>
  </AuthCard>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { useAppStore } from '@app/stores/appStore/index.js';
import AuthCard from '../components/AuthCard.vue';
import AuthField from '../components/AuthField.vue';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const password = ref('');
const confirmPassword = ref('');
const errors = ref({});

async function handleSubmit() {
  const nextErrors = {};
  if (!password.value || password.value.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
  if (password.value !== confirmPassword.value) nextErrors.confirmPassword = 'Passwords do not match.';
  errors.value = nextErrors;

  if (Object.keys(nextErrors).length > 0) {
    return;
  }

  const code = route.query.oobCode;
  if (!code) {
    toast.error('Reset link is invalid.');
    return;
  }

  loading.value = true;
  try {
    await store.resetPassword(String(code), password.value);
    toast.success('Password updated successfully.');
    router.push('/auth');
  } catch (error) {
    toast.error('Unable to update password.', {
      description: error?.message || 'Please request a fresh reset link.',
    });
  } finally {
    loading.value = false;
  }
}
</script>
