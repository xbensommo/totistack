<template>
  <AuthCard title="Create account" description="Generic starter registration form for Totistack projects.">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <AuthField v-model="form.firstName" label="First name" autocomplete="given-name" :error="errors.firstName" />
      <AuthField v-model="form.lastName" label="Last name" autocomplete="family-name" :error="errors.lastName" />
      <AuthField v-model="form.email" label="Email address" type="email" autocomplete="email" :error="errors.email" />
      <AuthField v-model="form.password" label="Password" type="password" autocomplete="new-password" :error="errors.password" />
      <AuthField v-model="form.confirmPassword" label="Confirm password" type="password" autocomplete="new-password" :error="errors.confirmPassword" />

      <label class="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
        <input v-model="form.acceptTerms" type="checkbox" class="mt-1 h-4 w-4 rounded border-slate-300" />
        <span>I accept the platform terms and privacy policy.</span>
      </label>
      <p v-if="errors.acceptTerms" class="text-xs font-medium text-red-600">{{ errors.acceptTerms }}</p>

      <button
        type="submit"
        class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        :disabled="loading"
      >
        {{ loading ? 'Creating account...' : 'Create account' }}
      </button>

      <p class="text-sm text-slate-600">
        Already have an account?
        <RouterLink class="font-medium text-slate-900" to="/auth">Sign in</RouterLink>
      </p>
    </form>
  </AuthCard>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import accessConfig from '@config/access.config.js';
import { useAppStore } from '@app/stores/appStore/index.js';
import AuthCard from '../components/AuthCard.vue';
import AuthField from '../components/AuthField.vue';

const store = useAppStore();
const router = useRouter();
const loading = ref(false);
const errors = ref({});
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
});

function validate() {
  const nextErrors = {};
  if (!form.firstName) nextErrors.firstName = 'First name is required.';
  if (!form.lastName) nextErrors.lastName = 'Last name is required.';
  if (!form.email) nextErrors.email = 'Email is required.';
  if (!form.password || form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
  if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';
  if (!form.acceptTerms) nextErrors.acceptTerms = 'You must accept the terms to continue.';
  errors.value = nextErrors;
  return Object.keys(nextErrors).length === 0;
}

async function handleSubmit() {
  if (!validate()) return;

  loading.value = true;
  try {
    await store.signUp(form.email, form.password, {
      firstName: form.firstName,
      lastName: form.lastName,
      displayName: `${form.firstName} ${form.lastName}`.trim(),
    });
    toast.success('Account created successfully.');
    router.push(accessConfig.routes.defaultAuthenticated || '/');
  } catch (error) {
    toast.error('Unable to create account.', {
      description: error?.message || 'Please review the form and try again.',
    });
  } finally {
    loading.value = false;
  }
}
</script>
