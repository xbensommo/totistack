<template>
  <div class="glass-panel p-6 sm:p-8 lg:p-12 animate-reveal max-w-full overflow-hidden">
    
    <header class="mb-8 lg:mb-10 text-center lg:text-left">
      <h3 class="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tighter italic leading-tight">
        New Security Key
      </h3>
      <p class="text-text-muted text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-2 leading-relaxed">
        Establish your new system access credentials
      </p>
    </header>

    <div v-if="success" class="text-center space-y-6 py-4">
      <div class="w-14 h-14 sm:w-16 sm:h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
        <i class="fa-solid fa-check text-xl sm:text-2xl"></i>
      </div>
      <p class="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">
        System Access Restored
      </p>
      <router-link to="/auth" class="btn-primary w-full block py-4 text-center">
        Sign In Now
      </router-link>
    </div>

    <form v-else @submit.prevent="handleReset" class="space-y-5 sm:space-y-6">
      <div v-for="field in resetFields" :key="field.id" class="group">
        <label class="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2 block group-focus-within:text-primary transition-colors">
          {{ field.label }}
        </label>
        
        <input 
          v-model="form[field.id]"
          :type="field.type"
          class="glass-input w-full text-base sm:text-sm"
          :placeholder="field.placeholder"
        />

        <!-- Password strength meter -->
        <div v-if="field.id === 'password'" class="mt-2">
          <div class="w-full h-2 bg-gray-200 rounded overflow-hidden">
            <div :class="strengthClass" :style="{ width: strengthPercent + '%' }" class="h-full transition-all"></div>
          </div>
          <p class="text-[9px] mt-1 uppercase font-bold" :class="strengthTextClass">{{ strengthText }}</p>
        </div>
        
        <p v-if="errors[field.id]" class="text-danger text-[9px] mt-1.5 font-bold animate-pulse">
          {{ errors[field.id] }}
        </p>
      </div>

      <button 
        :disabled="isLoading" 
        type="submit" 
        class="btn-primary w-full group py-4 flex items-center justify-center transition-all active:scale-[0.98]"
      >
        <span v-if="isLoading">
          <i class="fa-solid fa-spinner fa-spin mr-2"></i> Updating...
        </span>
        <span v-else class="flex items-center">
          Update Credentials 
          <i class="fa-solid fa-key ml-2 group-hover:rotate-12 transition-transform"></i>
        </span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useAppStore } from '@/stores/appStore';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { z } from 'zod';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@app/firebase';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const success = ref(false);
const errors = ref({});

const resetFields = [
  { id: 'password', label: 'New Security Key', type: 'password', placeholder: '••••••••' },
  { id: 'confirm', label: 'Confirm Key', type: 'password', placeholder: '••••••••' }
];

const form = reactive({ password: '', confirm: '' });

// Password validation schema
const schema = z.object({
  password: z.string().min(8, "Minimum 8 characters required"),
  confirm: z.string()
}).refine((data) => data.password === data.confirm, {
  message: "Keys do not match",
  path: ["confirm"],
});

// --- Password Strength Computed ---
const strengthScore = computed(() => {
  const pw = form.password;
  let score = 0;
  if (!pw) return score;

  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;

  return score;
});

const strengthPercent = computed(() => (strengthScore.value / 5) * 100);

const strengthText = computed(() => {
  switch (strengthScore.value) {
    case 0: return '';
    case 1: return 'Very Weak';
    case 2: return 'Weak';
    case 3: return 'Moderate';
    case 4: return 'Strong';
    case 5: return 'Very Strong';
    default: return '';
  }
});

const strengthClass = computed(() => {
  switch (strengthScore.value) {
    case 0: return 'bg-transparent';
    case 1: return 'bg-danger';
    case 2: return 'bg-warning';
    case 3: return 'bg-yellow-500';
    case 4: return 'bg-success/70';
    case 5: return 'bg-success';
    default: return 'bg-gray-200';
  }
});

const strengthTextClass = computed(() => {
  switch (strengthScore.value) {
    case 1: return 'text-danger';
    case 2: return 'text-warning';
    case 3: return 'text-yellow-600';
    case 4: return 'text-success/80';
    case 5: return 'text-success';
    default: return '';
  }
});

// --- On mounted, verify reset code ---
onMounted(async () => {
  const code = route.query.oobCode;
  if (!code) {
    toast.error("Invalid Request", { description: "Security code missing from link." });
    router.push('/auth');
    return;
  }
  try {
    await verifyPasswordResetCode(auth, code);
  } catch (e) {
    toast.error("Expired Link", { description: "This recovery link is no longer valid." });
    router.push('/auth/forgot-password');
  }
});

// --- Handle password reset ---
const handleReset = async () => {
  errors.value = {};
  const validation = schema.safeParse(form);
  if (!validation.success) {
    validation.error.issues.forEach(i => errors.value[i.path[0]] = i.message);
    return;
  }

  try {
    isLoading.value = true;
    await confirmPasswordReset(auth, route.query.oobCode, form.password);
    success.value = true;
    toast.success("system Key Updated");
  } catch (err) {
    toast.error("Update Failed", { description: err.message });
  } finally {
    isLoading.value = false;
  }
};
</script>