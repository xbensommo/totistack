<template>
  <div class="glass-panel p-6 sm:p-8 lg:p-10 max-w-md mx-auto animate-reveal">
    
    <header class="mb-8 sm:mb-10 text-center lg:text-left">
      <h3 class="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tighter italic leading-tight">
        Welcome Back
      </h3>
      <p class="text-text-muted text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-3 opacity-80">
        Enter credentials to login
      </p>
    </header>

    <!-- <div class="mb-6 sm:mb-8">
      <button 
        @click="handleSocialLogin('google')" 
        :disabled="isLoading"
        class="btn-ghost w-full flex items-center justify-center gap-3 border border-border/40 hover:bg-white/5 transition-all py-3.5 sm:py-3 active:scale-[0.98]"
      >
        <i class="fa-brands fa-google text-secondary"></i>
        <span class="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Continue with Google</span>
      </button>
    </div>

    <div class="relative flex py-4 sm:py-5 items-center">
      <div class="flex-grow border-t border-border/30"></div>
      <span class="flex-shrink mx-4 text-[8px] sm:text-[9px] text-text-muted uppercase tracking-[0.3em] whitespace-nowrap">
        Or use email
      </span>
      <div class="flex-grow border-t border-border/30"></div>
    </div> -->

    <form @submit.prevent="handleLogin" class="space-y-5 sm:space-y-6">
      <div v-for="field in loginFields" :key="field.id" class="group">
        <label :for="field.id" class="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2.5 block group-focus-within:text-primary transition-colors">
          {{ field.label }}
        </label>
        <input 
          v-model="form[field.id]"
          :type="field.type" 
          :id="field.id"
          :placeholder="field.placeholder"
          class="glass-input input-field w-full px-4 py-3 sm:py-2.5 focus:ring-1 focus:ring-primary/30 transition-all"
          :class="{ 'border-danger/50': errors[field.id] }"
        />
        <p v-if="errors[field.id]" class="text-danger text-[8px] sm:text-[9px] mt-1.5 font-bold uppercase">
          {{ errors[field.id] }}
        </p>
      </div>

      <div class="flex flex-row items-center justify-between py-2 gap-2">
        <label class="flex items-center gap-2.5 cursor-pointer group">
          <input type="checkbox" v-model="rememberMe" class="w-4 h-4 rounded border-border accent-secondary bg-transparent focus:ring-offset-0">
          <span class="text-[9px] sm:text-[10px] uppercase tracking-widest text-text-muted group-hover:text-secondary transition-colors whitespace-nowrap">
            Remember Me
          </span>
        </label>
        <router-link to="/auth/forgot-password" class="btn-ghost text-[9px] sm:text-[10px] uppercase font-bold hover:text-primary transition-colors whitespace-nowrap">
          Forgot Password?
        </router-link>
      </div>

      <button :disabled="isLoading" type="submit" class="btn-primary w-full group py-4 sm:py-3.5 shadow-lg active:scale-[0.97] transition-transform">
        <span v-if="isLoading" class="flex items-center justify-center gap-2">
          <i class="fa fa-spinner fa-spin"></i> 
          <span class="text-[11px] uppercase tracking-widest">Authenticating</span>
        </span>
        <span v-else class="flex items-center justify-center text-[11px] uppercase tracking-widest font-bold">
          Login <i class="fa fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
        </span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue-sonner';
import { z } from 'zod';

const store = useAuthStore();
const router = useRouter();
const route = useRoute();
const isLoading = ref(false);
const errors = ref({});
const rememberMe = ref(true);

const loginFields = [
  { id: 'email', label: 'Email Address', type: 'email', placeholder: 'info@email.com' },
  { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••' }
];

const form = reactive({ email: '', password: '' });

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(7, "Password must be at least 7 characters")
});

/**
 * Shared redirection logic
 */
const finalizeLogin = (user) => {
  toast.success("Identity Verified", { description: `Welcome back, ${user.data.displayName || user?.data.email}` });
  const destination = route.query.redirect || (user.data.role === 'admin' ? '/a' : '/my');
  router.push(destination);
};

/**
 * Handle Social Login
 * Uses fontawesome-free <i class="fa fa-google"></i>
 */
const handleSocialLogin = async (provider) => {
  try {
    isLoading.value = true;
    const user = await store.loginWithSocial(provider);
    finalizeLogin(user);
  } catch (err) {
    // Only toast if it's not the user closing the popup
    if (err.code !== 'auth/popup-closed-by-user') {
      toast.error("Social Auth Failed", { description: err.message });
    }
  } finally {
    isLoading.value = false;
  }
};

const handleLogin = async () => {
  errors.value = {};
  const validation = loginSchema.safeParse(form);
  
  if (!validation.success) {
    validation.error.issues.forEach(i => errors.value[i.path[0]] = i.message);
    return;
  }

  try {
    isLoading.value = true;
    const user = await store.login(form.email, form.password);
    finalizeLogin(user);
  } catch (err) {
    toast.error("Access Denied", { description: err.message });
  } finally {
    isLoading.value = false;
  }
};
</script>