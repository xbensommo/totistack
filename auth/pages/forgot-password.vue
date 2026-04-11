<template>
  <div class="glass-panel p-6 sm:p-8 lg:p-12 animate-reveal mx-auto w-full max-w-md lg:max-w-xl">
    
    <header class="mb-8 lg:mb-10">
      <h3 class="text-2xl lg:text-3xl font-display font-bold uppercase tracking-tighter italic leading-tight">
        Recovery
      </h3>
      <p class="text-text-muted text-[9px] lg:text-[10px] uppercase tracking-[0.2em] mt-2">
        Request password reset
      </p>
    </header>

    <div v-if="emailSent" class="space-y-6 text-center">
      <div class="w-14 h-14 lg:w-16 lg:h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fa-solid fa-paper-plane text-xl lg:text-2xl"></i>
      </div>
      <p class="text-[9px] lg:text-[10px] uppercase tracking-widest text-text-muted leading-relaxed">
        Instructions sent to <br/> 
        <span class="text-secondary font-bold break-all block mt-1">{{ email }}</span>
      </p>
      <router-link to="/auth" class="btn-primary w-full py-4 text-sm uppercase tracking-widest font-bold">
        Back to Login
      </router-link>
    </div>

    <form v-else @submit.prevent="handleReset" class="space-y-5 lg:space-y-6">
      <div class="group">
        <label class="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2 block">
          Email Address
        </label>
        <input 
          v-model="email" 
          type="email" 
          class="glass-input input-field w-full px-4 py-3 text-sm" 
          placeholder="Enter your email..."
        >
      </div>

      <div class="flex flex-col gap-3">
        <button 
          :disabled="isLoading" 
          type="submit" 
          class="btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest transition-all active:scale-95"
        >
          <span v-if="isLoading">Processing...</span>
          <span v-else>Submit</span>
        </button>

        <router-link 
          to="/auth" 
          class="btn-ghost w-full py-3 text-center block text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100"
        >
          Bakck to Login
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from './stores/auth-store';
import { toast } from 'vue-sonner';

const store = useAuthStore();
const email = ref('');
const isLoading = ref(false);
const emailSent = ref(false);

const handleReset = async () => {
  if (!email.value) return toast.warning("Email required");
  
  try {
    isLoading.value = true;
    await store.sendPasswordReset(email.value);
    emailSent.value = true;
    toast.success("Recovery Initialized");
  } catch (err) {
    toast.error("Recovery Failed", { description: err.message });
  } finally {
    isLoading.value = false;
  }
};
</script>