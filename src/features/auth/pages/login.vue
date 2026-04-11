<template>
  <AuthCard title="Sign in" description="Use email and password or one of the enabled providers.">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <AuthField v-model="form.email" label="Email address" type="email" autocomplete="email" :error="errors.email" />
      <AuthField v-model="form.password" label="Password" type="password" autocomplete="current-password" :error="errors.password" />

      <div class="flex items-center justify-between text-sm">
        <RouterLink class="font-medium text-slate-700 hover:text-slate-900" to="/auth/forgot-password">
          Forgot password?
        </RouterLink>
        <RouterLink class="font-medium text-slate-700 hover:text-slate-900" to="/auth/register">
          Create account
        </RouterLink>
      </div>

      <button
        type="submit"
        class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        :disabled="loading"
      >
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>

    <div v-if="socialProviders.length" class="my-6 border-t border-slate-200 pt-6">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Or continue with</p>
      <SocialAuthButtons :loading="loading" :providers="socialProviders" @select="handleSocial" />
    </div>
  </AuthCard>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import accessConfig from '@config/access.config.js';
import { useAppStore } from '@app/stores/appStore/index.js';
import AuthCard from '../components/AuthCard.vue';
import AuthField from '../components/AuthField.vue';
import SocialAuthButtons from '../components/SocialAuthButtons.vue';

const store = useAppStore();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const errors = ref({});
const form = reactive({
  email: '',
  password: '',
});

const socialProviders = computed(() => Object.entries(accessConfig.socialProviders || {})
  .filter(([, enabled]) => Boolean(enabled))
  .map(([id]) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
  })));

function validate() {
  const nextErrors = {};

  if (!form.email) nextErrors.email = 'Email is required.';
  if (!form.password) nextErrors.password = 'Password is required.';

  errors.value = nextErrors;
  return Object.keys(nextErrors).length === 0;
}

async function handleSubmit() {
  if (!validate()) return;

  loading.value = true;
  try {
    await store.login(form.email, form.password);
    toast.success('Signed in successfully.');
    router.push(route.query.redirect || accessConfig.routes.defaultAuthenticated || '/');
  } catch (error) {
    toast.error('Unable to sign in.', {
      description: error?.message || 'Please check your credentials and try again.',
    });
  } finally {
    loading.value = false;
  }
}

async function handleSocial(provider) {
  loading.value = true;
  try {
    await store.loginWithSocial(provider);
    toast.success('Signed in successfully.');
    router.push(route.query.redirect || accessConfig.routes.defaultAuthenticated || '/');
  } catch (error) {
    toast.error('Unable to sign in with provider.', {
      description: error?.message || 'The provider flow could not be completed.',
    });
  } finally {
    loading.value = false;
  }
}
</script>
