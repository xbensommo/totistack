<template>
  <AuthCard
    eyebrow="Account settings"
    title="Manage your profile"
    description="Starter profile page wired into the shared root store with a cleaner settings-style layout."
  >
    <div class="space-y-6">
      <section class="form-section">
        <div class="mb-6">
          <p class="text-caption">Profile details</p>
          <h2 class="mt-2 text-xl font-semibold text-[var(--color-text)]">Personal information</h2>
        </div>

        <form class="space-y-5" @submit.prevent="saveProfile">
          <AuthField v-model="form.displayName" label="Display name" autocomplete="name" placeholder="Your public display name" />

          <div class="grid gap-5 sm:grid-cols-2">
            <AuthField v-model="form.firstName" label="First name" autocomplete="given-name" placeholder="First name" />
            <AuthField v-model="form.lastName" label="Last name" autocomplete="family-name" placeholder="Last name" />
          </div>

          <AuthField v-model="form.phoneNumber" label="Phone number" autocomplete="tel" placeholder="+264 ..." />

          <button type="submit" class="btn-primary w-full" :disabled="saving">
            {{ saving ? 'Saving profile...' : 'Save profile' }}
          </button>
        </form>
      </section>

      <section class="form-section border-theme">
        <div class="mb-6">
          <p class="text-caption">Security</p>
          <h2 class="mt-2 text-xl font-semibold text-[var(--color-text)]">Password update</h2>
        </div>

        <form class="space-y-5" @submit.prevent="savePassword">
          <AuthField v-model="passwordForm.currentPassword" label="Current password" type="password" autocomplete="current-password" placeholder="Enter current password" />
          <AuthField v-model="passwordForm.newPassword" label="New password" type="password" autocomplete="new-password" placeholder="Minimum 8 characters" />

          <button type="submit" class="btn-secondary w-full" :disabled="savingPassword">
            {{ savingPassword ? 'Updating password...' : 'Change password' }}
          </button>
        </form>
      </section>

      <button type="button" class="btn-outline w-full border-red-400/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" @click="signOut">
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
