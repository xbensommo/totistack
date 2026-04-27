<template>
  <AuthCard
    eyebrow="Create account"
    title="Launch your access profile"
    description="Generic Totistack starter registration form with a cleaner premium visual layer."
  >
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="grid gap-5 sm:grid-cols-2">
        <AuthField v-model="form.firstName" label="First name" autocomplete="given-name" placeholder="John" :error="errors.firstName" />
        <AuthField v-model="form.lastName" label="Last name" autocomplete="family-name" placeholder="Doe" :error="errors.lastName" />
      </div>

      <AuthField v-model="form.email" label="Email address" type="email" autocomplete="email" placeholder="you@company.com" :error="errors.email" />
      <AuthField v-model="form.password" label="Password" type="password" autocomplete="new-password" placeholder="Minimum 8 characters" :error="errors.password" />
      <AuthField v-model="form.confirmPassword" label="Confirm password" type="password" autocomplete="new-password" placeholder="Repeat your password" :error="errors.confirmPassword" />

      <label class="option-card items-start">
        <input v-model="form.acceptTerms" type="checkbox" class="mt-1 h-4 w-4 rounded border-theme text-[var(--color-primary)]" />
        <span>I accept the platform terms and privacy policy.</span>
      </label>
      <p v-if="errors.acceptTerms" class="field-error">{{ errors.acceptTerms }}</p>

      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Create account' }}
      </button>

      <p class="text-sm text-soft">
        Already have an account?
        <RouterLink class="font-semibold text-primary transition hover:opacity-80" to="/auth">Sign in</RouterLink>
      </p>
    </form>
  </AuthCard>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import accessConfig from '@config/access.config.js';
import { useAppStore } from '@app/stores/appStore/index.js';
import AuthCard from '../components/AuthCard.vue';
import AuthField from '../components/AuthField.vue';

const store = useAppStore();
const router = useRouter();
const route = useRoute();
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
      email: form.email,
      inviteToken: String(route.query.invite || route.query.token || ''),
    });
    toast.success('Account created successfully.');
    router.push(accessConfig.routes.defaultAuthenticated || '/crm');
  } catch (error) {
    toast.error('Unable to create account.', {
      description: error?.message || 'Please review the form and try again.',
    });
  } finally {
    loading.value = false;
  }
}
</script>
