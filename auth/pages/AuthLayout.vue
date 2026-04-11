<script setup>
  import { ref, computed } from 'vue';
  import { useAuthStore } from './stores/auth-store';
  import { RouterView, RouterLink, useRoute } from 'vue-router';
  import { toast } from 'vue-sonner';

  const store = useAuthStore();
  const route = useRoute();
  const isMobileMenuOpen = ref(false);

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };

// Global Loading State from Store
  const isLoading = computed(() => store.loading);

/**
* Global Navigation Error Handling
*/
  const handleNavError = (err) => {
    console.error('[AuthLayout Navigation Error]:', err);
    toast.error("Gateway Timeout", {
      description: "The  authentication module is currently unavailable."
    });
  };
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#FAFAF9] text-[var(--color-primary)] font-sans selection:bg-[var(--color-secondary)]/20">

    <header class="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto px-6 lg:px-12">
        <div class="flex justify-between items-center h-20">

          <router-link to="/" class="flex items-center space-x-4 group">
            <div class="w-12 h-12 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <img 
              src="@/assets/transparent.png" 
              alt="Logo" 
              class="w-full h-full object-contain"
              />
            </div>

            <div class="flex flex-col">
              <span class="font-serif text-lg font-bold tracking-tighter leading-none italic uppercase">
                {{ appName }}
              </span>
              <span class="text-[8px] uppercase tracking-[0.4em] text-gray-400 font-bold">
                S
              </span>
            </div>
          </router-link>

          <nav class="hidden md:flex items-center space-x-10">
            <router-link to="/auth" class="text-[10px] uppercase font-bold tracking-widest hover:text-[var(--color-secondary)] transition-colors">Sign In</router-link>
            <router-link to="/auth/register" class="text-[10px] uppercase font-bold tracking-widest hover:text-[var(--color-secondary)] transition-colors">Sign Up</router-link>
        </nav>

        <button @click="toggleMobileMenu" class="md:hidden p-2 text-[var(--color-primary)]">
          <i :class="['fa-solid text-xl', isMobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered']"></i>
        </button>
      </div>
    </div>
  </header>

  <transition name="reveal">
    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[90] bg-white/98 backdrop-blur-xl flex flex-col items-center justify-center space-y-8">
      <router-link @click="isMobileMenuOpen = false" to="/auth" class="font-serif text-3xl italic">Sign In</router-link>
      <router-link @click="isMobileMenuOpen = false" to="/auth/register" class="font-serif text-3xl italic">Register</router-link>
      
      <button @click="isMobileMenuOpen = false" class="mt-12 w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center">
        <i class="fa-solid fa-xmark text-gray-400"></i>
      </button>
    </div>
  </transition>

  <main class="flex-grow flex items-center justify-center py-12 px-6 lg:px-12 relative overflow-hidden">

    <div class="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--color-secondary)]/5 rounded-full blur-[100px] pointer-events-none animate-float"></div>
    <div class="absolute bottom-1/4 -right-20 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-[80px] pointer-events-none animate-float" style="animation-delay: -3s"></div>

    <div class="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">

      <div class="hidden lg:flex flex-col w-1/2 space-y-8 animate-reveal">
        <h2 class="text-7xl text-[var(--color-primary)] leading-[0.85] font-serif italic lowercase tracking-tighter">
          Your <span class="text-[var(--color-secondary)]">journey</span> <br/>
          to clarity <br/>
          begins here.
        </h2>
        <div class="w-24 h-[1px] bg-[var(--color-secondary)]"></div>

        <p class="max-w-md text-gray-500 text-xs leading-relaxed uppercase tracking-widest font-bold opacity-80">
          Welcome, Authenticate to gain access.
        </p>

        <div class="flex items-center gap-6 pt-6">
          <div class="flex -space-x-3">
            <div v-for="i in 3" :key="i" class="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] text-[var(--color-secondary)]">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex justify-center lg:justify-end animate-reveal" style="animation-delay: 0.2s">
        <div class="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-black/5 border border-gray-100">
          <RouterView v-slot="{ Component }">
            <transition name="reveal" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </div>
      </div>
    </div>
  </main>

  <footer class="py-12 border-t border-gray-100 bg-white">
    <div class="container mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-6">
      <p class="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold">
        &copy; {{ new Date().getFullYear() }} {{ appName }}
      </p>
      <div class="flex items-center gap-8">
        <a href="#" class="text-[9px] uppercase tracking-widest font-bold hover:text-[var(--color-secondary)]">Client Consent Policy</a>
        <a href="#" class="text-[9px] uppercase tracking-widest font-bold hover:text-[var(--color-secondary)]">Confidentiality Protocol</a>
      </div>
    </div>
  </footer>

  <transition name="reveal">
    <div v-if="isLoading" class="fixed inset-0 z-[200] bg-[var(--color-primary)]/10 backdrop-blur-[2px] flex items-center justify-center">
      <div class="w-12 h-[2px] bg-[var(--color-secondary)] animate-pulse"></div>
    </div>
  </transition>

</div>
</template>

<style scoped>
  .font-serif { font-family: 'Playfair Display', serif; }

  .reveal-enter-active, .reveal-leave-active {
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal-enter-from, .reveal-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }

  @keyframes float {
    0% { transform: translate(0, 0); }
    50% { transform: translate(10px, -20px); }
    100% { transform: translate(0, 0); }
  }

  .animate-float {
    animation: float 8s ease-in-out infinite;
  }

  @media (min-width: 1024px) {
    main {
      min-height: calc(100vh - 160px);
    }
  }
</style>