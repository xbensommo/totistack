<template>
  <AuthCard title="My profile" description="Starter profile page wired into the shared root store.">
    <div class="space-y-6">
      <form class="space-y-4" @submit.prevent="saveProfile">
        <AuthField v-model="form.displayName" label="Display name" autocomplete="name" />
        <AuthField v-model="form.firstName" label="First name" autocomplete="given-name" />
        <AuthField v-model="form.lastName" label="Last name" autocomplete="family-name" />
        <AuthField v-model="form.phoneNumber" label="Phone number" autocomplete="tel" />
        <button
          type="submit"
          class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="saving"
        >
          {{ saving ? 'Saving profile...' : 'Save profile' }}
        </button>
      </form>

      <form class="space-y-4 border-t border-slate-200 pt-6" @submit.prevent="savePassword">
        <AuthField v-model="passwordForm.currentPassword" label="Current password" type="password" autocomplete="current-password" />
        <AuthField v-model="passwordForm.newPassword" label="New password" type="password" autocomplete="new-password" />
        <button
          type="submit"
          class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="savingPassword"
        >
          {{ savingPassword ? 'Updating password...' : 'Change password' }}
        </button>
      </form>

      <button
        type="button"
        class="w-full rounded-2xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        @click="signOut"
      >
        Sign out
      </button>
    </div>
  </AuthCard>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import accessConfig from '@config/access.config.js';
import { useAppStore } from '@app/stores/appStore/index.js';
import AuthCard from '../components/AuthCard.vue';
import AuthField from '../components/AuthField.vue';

const store = useAppStore();
const router = useRouter();
const saving = ref(false);
const savingPassword = ref(false);

const form = reactive({
  displayName: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
});

watch(
  () => store.currentUser,
  (user) => {
    form.displayName = user?.displayName || '';
    form.firstName = user?.firstName || '';
    form.lastName = user?.lastName || '';
    form.phoneNumber = user?.phoneNumber || '';
  },
  { immediate: true },
);

async function saveProfile() {
  saving.value = true;
  try {
    await store.updateProfile({ ...form });
    toast.success('Profile updated.');
  } catch (error) {
    toast.error('Unable to update profile.', {
      description: error?.message || 'Please try again.',
    });
  } finally {
    saving.value = false;
  }
}

async function savePassword() {
  savingPassword.value = true;
  try {
    await store.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    toast.success('Password updated.');
  } catch (error) {
    toast.error('Unable to update password.', {
      description: error?.message || 'Please try again.',
    });
  } finally {
    savingPassword.value = false;
  }
}

async function signOut() {
  await store.logout();
  router.push(accessConfig.routes.logoutRedirect || '/auth');
}
</script>
