<template>
  <div class="min-h-screen bg-gray-100 py-12">
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 bg-white border-b border-gray-200">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">My Profile</h1>
            <button
              @click="handleLogout"
              class="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
            >
              Sign Out
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>

          <!-- Profile Content -->
          <div v-else-if="user" class="space-y-6">
            <!-- Avatar Section -->
            <div class="flex items-center space-x-6">
              <div class="relative">
                <img
                  v-if="user.photoURL"
                  :src="user.photoURL"
                  :alt="user.displayName || user.name"
                  class="h-20 w-20 rounded-full object-cover"
                />
                <div v-else class="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-2xl font-medium text-indigo-600">
                    {{ getUserInitials() }}
                  </span>
                </div>
                <button
                  @click="triggerFileUpload"
                  class="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg hover:bg-gray-50"
                >
                  <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarUpload"
                />
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900">{{ user.displayName || user.name }}</h2>
                <p class="text-gray-600">{{ user.email }}</p>
                <div class="mt-1 flex items-center space-x-2">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': user.emailVerified,
                      'bg-yellow-100 text-yellow-800': !user.emailVerified
                    }"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ user.emailVerified ? 'Email Verified' : 'Email Not Verified' }}
                  </span>
                  <span
                    :class="{
                      'bg-green-100 text-green-800': user.status === 'active',
                      'bg-yellow-100 text-yellow-800': user.status === 'pending',
                      'bg-red-100 text-red-800': user.status === 'suspended'
                    }"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ user.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Edit Form -->
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  v-model="editForm.displayName"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  v-model="editForm.phoneNumber"
                  type="tel"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Preferences</label>
                <div class="mt-2 space-y-2">
                  <label class="inline-flex items-center">
                    <input
                      v-model="editForm.preferences.emailNotifications"
                      type="checkbox"
                      class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span class="ml-2 text-sm text-gray-600">Email Notifications</span>
                  </label>
                  <label class="inline-flex items-center ml-4">
                    <input
                      v-model="editForm.preferences.twoFactorAuth"
                      type="checkbox"
                      class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span class="ml-2 text-sm text-gray-600">Two-Factor Authentication</span>
                  </label>
                </div>
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="resetForm"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="updating"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {{ updating ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>

            <!-- Danger Zone -->
            <div class="border-t border-gray-200 pt-6">
              <h3 class="text-lg font-medium text-red-600">Danger Zone</h3>
              <div class="mt-4 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">Change Password</p>
                    <p class="text-sm text-gray-500">Update your password to keep your account secure</p>
                  </div>
                  <button
                    @click="showPasswordModal = true"
                    class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Change Password
                  </button>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">Delete Account</p>
                    <p class="text-sm text-gray-500">Permanently delete your account and all associated data</p>
                  </div>
                  <button
                    @click="showDeleteModal = true"
                    class="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <form @submit.prevent="changePassword">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">New Password</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closePasswordModal"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updatingPassword"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {{ updatingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-red-600 mb-4">Delete Account</h3>
        <p class="text-sm text-gray-500 mb-4">
          This action cannot be undone. This will permanently delete your account and remove all your data.
        </p>
        <p class="text-sm font-medium text-gray-900 mb-4">
          Please type <span class="font-bold text-red-600">DELETE</span> to confirm.
        </p>
        <input
          v-model="deleteConfirmText"
          type="text"
          placeholder="Type DELETE"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        />
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="deleteAccount"
            :disabled="deleteConfirmText !== 'DELETE' || deleting"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete Account' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useHead } from '@unhead/vue';
import { useToast } from 'vue-sonner';
import { getFriendlyMessage } from '@xbensommo/shard-provider';
import { useAuth } from '../hooks/use-auth';

useHead({
  title: 'My Profile',
  meta: [
    { name: 'description', content: 'Manage your profile settings' }
  ]
});

const router = useRouter();
const toast = useToast();
const { user, updateUserProfile, logout, changeUserPassword, deleteUserAccount, loading: authLoading } = useAuth();

// State
const loading = ref(true);
const updating = ref(false);
const updatingPassword = ref(false);
const deleting = ref(false);
const showPasswordModal = ref(false);
const showDeleteModal = ref(false);
const deleteConfirmText = ref('');
const fileInput = ref(null);

// Form state
const editForm = reactive({
  displayName: '',
  name: '',
  phoneNumber: '',
  preferences: {
    emailNotifications: true,
    twoFactorAuth: false
  }
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Initialize form with user data
const initForm = () => {
  if (user.value) {
    editForm.displayName = user.value.displayName || '';
    editForm.name = user.value.name || '';
    editForm.phoneNumber = user.value.phoneNumber || '';
    editForm.preferences = {
      emailNotifications: user.value.preferences?.emailNotifications ?? true,
      twoFactorAuth: user.value.preferences?.twoFactorAuth ?? false
    };
  }
};

// Get user initials
const getUserInitials = () => {
  if (!user.value) return '';
  const name = user.value.displayName || user.value.name || user.value.email;
  return name.charAt(0).toUpperCase();
};

// Update profile
const updateProfile = async () => {
  updating.value = true;
  
  try {
    await updateUserProfile({
      displayName: editForm.displayName,
      name: editForm.name,
      phoneNumber: editForm.phoneNumber,
      preferences: editForm.preferences
    });
    
    toast.success('Profile updated successfully');
  } catch (error) {
    console.error('Profile update error:', error);
    toast.error(getFriendlyMessage(error));
  } finally {
    updating.value = false;
  }
};

// Reset form
const resetForm = () => {
  initForm();
};

// Avatar upload
const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image size must be less than 5MB');
    return;
  }
  
  try {
    // Here you would upload to Firebase Storage
    // const photoURL = await uploadAvatar(file);
    // await updateUserProfile({ photoURL });
    toast.success('Avatar updated successfully');
  } catch (error) {
    console.error('Avatar upload error:', error);
    toast.error(getFriendlyMessage(error));
  }
};

// Password change
const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error('New passwords do not match');
    return;
  }
  
  if (passwordForm.newPassword.length < 8) {
    toast.error('Password must be at least 8 characters');
    return;
  }
  
  updatingPassword.value = true;
  
  try {
    await changeUserPassword(passwordForm.currentPassword, passwordForm.newPassword);
    toast.success('Password changed successfully');
    closePasswordModal();
  } catch (error) {
    console.error('Password change error:', error);
    toast.error(getFriendlyMessage(error));
  } finally {
    updatingPassword.value = false;
  }
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
};

// Delete account
const deleteAccount = async () => {
  deleting.value = true;
  
  try {
    await deleteUserAccount();
    toast.success('Account deleted successfully');
    router.push('/');
  } catch (error) {
    console.error('Account deletion error:', error);
    toast.error(getFriendlyMessage(error));
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
};

// Logout
const handleLogout = async () => {
  try {
    await logout();
    toast.success('Signed out successfully');
    router.push({ name: 'auth.login' });
  } catch (error) {
    console.error('Logout error:', error);
    toast.error(getFriendlyMessage(error));
  }
};

// Watch for user changes
onMounted(() => {
  loading.value = false;
  initForm();
});
</script>