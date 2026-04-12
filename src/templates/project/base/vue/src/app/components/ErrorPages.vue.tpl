<script setup>
import { useRouter } from 'vue-router';
import { useHead } from '@unhead/vue';

const router = useRouter();
const props = defineProps(['code', 'message', 'description']);

useHead({
  title: `${props.code || 'Notice'} | {{appName}}`
});

const goBack = () => {
  if (router.options.history.state.back) {
    router.back();
  } else {
    router.push('/');
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-6 overflow-hidden selection:bg-[var(--color-primary)] selection:text-white">
    
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <h1 class="error-code text-[60vw] font-display font-bold text-black/[0.02] tracking-tighter leading-none select-none">
        {{ code || '403' }}
      </h1>
    </div>

    <div class="relative z-10 container max-w-2xl flex flex-col items-center text-center">
      
      <div class="reveal-icon mb-12 flex items-center justify-center w-20 h-20 rounded-full border border-black/5 bg-white/50 backdrop-blur-sm">
        <i class="fas fa-fingerprint text-[var(--color-secondary)] text-2xl animate-pulse"></i>
      </div>

      <div class="reveal-text">
        <span class="text-[10px] uppercase tracking-[0.5em] text-[var(--color-primary)] font-bold mb-6 block">
          Digital Boundary
        </span>
        
        <h2 class="text-5xl md:text-7xl font-display font-bold text-[var(--color-text)] tracking-tighter mb-8 leading-[0.9]">
          {{ message || 'Path Restricted' }}<span class="text-[var(--color-secondary)] italic">.</span>
        </h2>
        
        <p class="text-gray-500 text-lg md:text-xl font-light max-w-md mx-auto mb-16 leading-relaxed">
          {{ description || "This area is architecturally private. Let's guide you back to the public spaces of TotiSoft." }}
        </p>
      </div>

      <div class="reveal-buttons flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
        <button 
          @click="goBack" 
          class="group px-8 py-5 border border-black/10 hover:border-black text-[10px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center"
        >
          <i class="fas fa-chevron-left mr-3 group-hover:-translate-x-2 transition-transform"></i> 
          Step Back
        </button>
        
        <button 
          @click="router.push('/')" 
          class="px-10 py-5 bg-[var(--color-accent)] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[var(--color-primary)] hover:shadow-2xl hover:shadow-[var(--color-primary)]/20 hover:-translate-y-1 transition-all duration-500"
        >
          Return root page
        </button>
      </div>
    </div>

    <footer class="absolute bottom-12 reveal-text opacity-40">
      <p class="text-[10px] uppercase tracking-widest font-mono">TotiSoft Cc— Namibia / {{ new Date().getFullYear()}}</p>
    </footer>
  </div>
</template>