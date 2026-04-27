<template>
  <div class="min-h-screen bg-[#FAFAF9] pt-40 pb-32 px-6 selection:bg-[var(--color-primary)] selection:text-white">
    <div class="container mx-auto max-w-7xl">
      
      <header class="mb-24 reveal-header border-b border-black/5 pb-16">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div class="max-w-3xl">
            <span class="text-[var(--color-secondary)] font-bold tracking-[0.4em] text-[10px] uppercase mb-4 block">
              Legal Framework
            </span>
            <h1 class="font-display text-5xl md:text-8xl tracking-tighter text-[var(--color-text)] mb-6">
              Terms of <span class="italic font-serif font-light text-[var(--color-primary)]">Service</span>
            </h1>
            <p class="text-gray-500 font-mono text-[10px] uppercase tracking-widest">
              Last Revised: March 10, 2026
            </p>
          </div>
        </div>
      </header>

      <div class="grid lg:grid-cols-12 gap-16">
        
        <aside class="lg:col-span-3 reveal-content hidden lg:block">
          <nav class="sticky top-32">
            <h4 class="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-8">Clauses</h4>
            <ul class="space-y-4">
              <li v-for="(section, index) in tosSections" :key="index">
                <a :href="'#' + section.id" class="text-xs text-gray-500 hover:text-[var(--color-primary)] transition-colors flex items-center gap-3 group">
                  <span class="font-mono opacity-30 text-[9px]">0{{ index + 1 }}</span>
                  <span class="uppercase tracking-widest group-hover:translate-x-1 transition-transform">{{ section.title }}</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <main class="lg:col-span-9 space-y-24 reveal-content">
          <section class="max-w-3xl">
            <p class="text-xl text-[var(--color-text)] font-light leading-relaxed italic border-l-2 border-[var(--color-secondary)] pl-8">
              "By engaging with TotiSoft CC, you are entering into a partnership defined by clarity, technical excellence, and mutual respect. These terms architect our shared journey."
            </p>
          </section>

          <section v-for="(section, index) in tosSections" :key="section.id" :id="section.id" class="scroll-mt-32 pt-12 border-t border-black/5">
            <div class="grid md:grid-cols-12 gap-8">
              <div class="md:col-span-4">
                <span class="font-mono text-[10px] text-[var(--color-secondary)] mb-4 block">Article 0{{ index + 1 }}</span>
                <h3 class="text-2xl font-display font-bold tracking-tight text-[var(--color-text)]">{{ section.title }}</h3>
              </div>
              <div class="md:col-span-8">
                <div class="text-gray-600 leading-relaxed font-light text-lg space-y-6" v-html="section.content"></div>
              </div>
            </div>
          </section>
          
          <footer class="bg-[var(--color-primary)] p-12 rounded-[40px] text-white overflow-hidden relative">
            <div class="relative z-10">
              <h3 class="font-serif text-3xl mb-8 italic">Legal Inquiries</h3>
              <div class="grid md:grid-cols-2 gap-12 text-[10px] uppercase tracking-[0.2em] font-bold">
                <div>
                  <p class="text-white/40 mb-2">Electronic Mail</p>
                  <a href="mailto:info@totisoft.com" class="hover:text-[var(--color-secondary)] transition-colors">info@totisoft.com</a>
                </div>
                <div>
                  <p class="text-white/40 mb-2">Jurisdiction</p>
                  <p>Rundu, Namibia</p>
                </div>
              </div>
            </div>
            <i class="fas fa-file-contract absolute -right-8 -bottom-8 text-white/5 text-[200px] rotate-12"></i>
          </footer>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useHead } from '@unhead/vue';
import { gsap } from 'gsap';

// SEO Meta Management
useHead({
  title: 'Terms of Service | TotiSoft CC Namibia',
  meta: [
    { name: 'description', content: 'The legal framework governing digital partnerships with TotiSoft CC.' },
    { name: 'keywords', content: 'Web Design Namibia, TotiSoft Terms, Digital Agency Contract' }
  ]
});

const tosSections = [
  { 
    id: "services", 
    title: "Service Scope", 
    content: "TotiSoft CC delivers high-fidelity digital solutions including <strong>UX/UI Design, Web Architecture, API Integration,</strong> and <strong>Technical Consulting</strong>. Deliverables are explicitly defined in individual project blueprints." 
  },
  { 
    id: "responsibilities", 
    title: "Client Synergy", 
    content: "Success is a collaborative effort. Clients agree to provide accurate branding materials, timely feedback, and project-critical assets to ensure delivery within defined milestones." 
  },
  { 
    id: "payment", 
    title: "Financial Terms", 
    content: "Engagement is predicated on the agreed quotation. TotiSoft maintains the right to pause service architecture or withhold final deployment for accounts with outstanding fiscal obligations." 
  },
  { 
    id: "ip", 
    title: "Intellectual Property", 
    content: "Clients retain ownership of content. TotiSoft retains ownership of the underlying <strong>proprietary frameworks, scripts, and developmental logic</strong> utilized to execute the project." 
  },
  { 
    id: "liability", 
    title: "Liability & Risk", 
    content: "TotiSoft shall not be liable for incidental damages. Our total liability is capped at the amount transacted for the specific service provided." 
  }
];

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.5 } });

  tl.from(".reveal-header", {
    y: 80,
    opacity: 0
  })
  .from(".reveal-content", {
    y: 40,
    opacity: 0,
    stagger: 0.2
  }, "-=1");
});
</script>