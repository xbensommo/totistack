<template>
  <transition name="cookie-tray">
    <div v-if="!isVisible" class="fixed bottom-0 left-0 w-full z-[100] p-6 pointer-events-none">
      <div class="container mx-auto max-w-7xl">
        <div class="bg-white/80 backdrop-blur-2xl border border-black/5 p-8 md:p-10 rounded-[40px] shadow-2xl pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div class="flex items-center gap-6 max-w-2xl">
            <div class="hidden md:flex w-16 h-16 bg-[var(--color-primary)]/10 rounded-full items-center justify-center text-[var(--color-primary)]">
              <i class="fas fa-cookie-bite text-2xl"></i>
            </div>
            <div>
              <h4 class="font-display font-bold text-lg tracking-tight mb-2">Digital Preferences</h4>
              <p class="text-sm text-gray-500 leading-relaxed">
                We use cookies to architect a better experience. By continuing, you agree to our 
                <router-link to="/cookie-policy" class="text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-secondary)] transition-colors">Cookie Policy</router-link>.
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button @click="acceptCookies" class="w-full sm:w-auto px-10 py-4 bg-[var(--color-accent)] text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[var(--color-primary)] transition-all duration-500 rounded-full">
              Accept All
            </button>
            <button @click="isVisible = true" class="w-full sm:w-auto px-10 py-4 border border-black/10 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-black/5 transition-all rounded-full">
              Decline
            </button>
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';

const isVisible = ref(true); // Hidden by default

const acceptCookies = () => {
  localStorage.setItem('site__cookies_accepted', 'true');
  isVisible.value = true;
  
  // Optional: Trigger a small "Success" toast or haptic feedback
  console.log("Preferences Saved.");
};

onMounted(() => {
  const status = localStorage.getItem('site__cookies_accepted');
  if (!status) {
    // Small delay before showing the banner for better UX flow
    setTimeout(() => {
      isVisible.value = false;
    }, 1500);
  }
});
</script>

<style scoped>
.cookie-tray-enter-active, .cookie-tray-leave-active {
  transition: all 0.8s cubic-bezier(0.85, 0, 0.15, 1);
}
.cookie-tray-enter-from, .cookie-tray-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>