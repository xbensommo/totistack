<template>
  <div class="min-h-screen bg-[#FAFAF9] pt-40 pb-32 px-6 selection:bg-[var(--color-primary)] selection:text-white">
    <div class="container mx-auto max-w-4xl">
      
      <header class="mb-24 reveal-header text-center">
        <span class="text-[var(--color-secondary)] font-bold tracking-[0.4em] text-[10px] uppercase mb-6 block">
          Knowledge Base
        </span>
        <h1 class="font-display text-5xl md:text-7xl tracking-tighter text-[var(--color-text)] mb-8">
          Frequently Asked <br><span class="italic font-serif font-light text-[var(--color-primary)]">Inquiries</span>
        </h1>
        <p class="text-gray-500 font-light text-lg">Everything you need to know about partnering with Totisoft CC.</p>
      </header>

      <div class="reveal-content space-y-4">
        <div 
          v-for="(faq, index) in faqData" 
          :key="index" 
          class="bg-white border border-black/5 rounded-2xl overflow-hidden transition-all duration-500"
        >
          <button 
            @click="activeIndex = activeIndex === index ? null : index"
            class="w-full p-8 flex items-center justify-between text-left hover:bg-black/[0.02] transition-colors"
          >
            <span class="font-bold text-[var(--color-text)]">{{ faq.q }}</span>
            <i :class="activeIndex === index ? 'rotate-180' : ''" class="fas fa-chevron-down text-[var(--color-secondary)] transition-transform duration-500"></i>
          </button>
          
          <div 
            v-show="activeIndex === index" 
            class="px-8 pb-8 text-gray-500 font-light leading-relaxed border-t border-black/5 pt-6"
          >
            <div v-html="faq.a"></div>
          </div>
        </div>
      </div>
      
      <div class="mt-24 text-center reveal-content">
        <p class="text-gray-400 mb-8 uppercase tracking-widest text-[10px] font-bold">Still have questions?</p>
        <a href="mailto:info@totisoft.com" class="inline-block px-12 py-5 bg-[var(--color-primary)] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[var(--color-secondary)] transition-all rounded-full">
          Consult Our Team
        </a>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useHead } from '@vueuse/head';
import { gsap } from 'gsap';

const activeIndex = ref(0);

useHead({
  title: 'FAQ | Digital Solutions & Development | TotiSoft CC',
  meta: [
    { name: 'description', content: 'Answers to common questions about our website design, mobile app development, hosting, and migration services in Namibia.' }
  ]
});

const faqData = [
  { q: "What services does Totisoft provide?", a: "We provide end-to-end digital architecture including responsive web design, E-commerce, mobile app development, and technical maintenance." },
  { q: "How long does a typical build take?", a: "Standard websites take 2-4 weeks. E-commerce platforms range from 4-6 weeks, and custom web applications typically require 6-12 weeks." },
  { q: "Do you offer ongoing support?", a: "Yes. Our support plans cover security updates, performance optimization, bug fixes, and feature enhancements to ensure your digital growth." },
  { q: "What is the offboarding process?", a: "We provide full migration support, including file and database exports, domain transfer assistance, and documentation to ensure you retain full ownership of your assets." }
];

onMounted(() => {
  gsap.from(".reveal-header", { y: 60, opacity: 0, duration: 1.2, ease: "expo.out" });
  gsap.from(".reveal-content > div", { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: "power4.out" });
});
</script>