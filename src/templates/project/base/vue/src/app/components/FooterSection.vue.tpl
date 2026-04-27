<template>
  <footer
    class="relative overflow-hidden border-t border-slate-800/60 bg-[#0B0F14] text-white pt-24 pb-8 px-6 md:px-16"
  >
    <!-- Background -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="
          background-image:
            linear-gradient(#1860A8 1px, transparent 1px),
            linear-gradient(90deg, #1860A8 1px, transparent 1px);
          background-size: 64px 64px;
        "
      ></div>

      <div
        class="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"
      ></div>
    </div>

    <div class="relative mx-auto max-w-7xl">
      <!-- Top -->
      <div class="grid grid-cols-1 gap-14 border-b border-slate-800/60 pb-14 lg:grid-cols-[1.2fr_0.8fr]">
        <!-- Brand / Main copy -->
        <div class="max-w-2xl">
          <div class="mb-8 flex items-center gap-4">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-lg">
              <img
                class="h-auto w-16 rounded-xl md:w-20"
                src=""
                alt="Totisoft Logo"
              />
            </div>
          </div>

          <h3 class="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Based in <span class="text-primary">Rundu</span>. <br />
            Built for businesses across Namibia.
          </h3>

          <p class="mt-6 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
            Totisoft designs and supports websites that help businesses look credible,
            get found online, and operate more smoothly — with hosting, business email,
            managed support, SEO foundations, and long-term maintenance options.
          </p>

          <!-- Service highlights -->
          <div class="mt-8 flex flex-wrap gap-3">
            <span
              v-for="item in serviceBadges"
              :key="item"
              class="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-slate-300"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <!-- Contact / CTA -->
        <div class="space-y-4">
          <div class="mb-2 flex items-center gap-3">
            <div class="h-[2px] w-10 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
            <span class="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
              Start a project
            </span>
          </div>

          <a
            href="mailto:info@totisoft.com"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-white/10"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-xs text-slate-400">Email</p>
              <p class="text-base font-semibold text-white">info@totisoft.com</p>
            </div>
            <svg
              class="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="tel:+264858140709"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-white/10"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-xs text-slate-400">Phone / WhatsApp</p>
              <p class="text-base font-semibold text-white">+264 85 814 0709</p>
            </div>
            <svg
              class="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="/assessment"
            class="group flex items-center justify-between rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 to-secondary/10 p-4 transition-all duration-300 hover:border-primary/40 hover:from-primary/20 hover:to-secondary/15"
          >
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Recommended first step</p>
              <p class="mt-1 text-base font-semibold text-white">Take the 1-minute digital assessment</p>
            </div>
            <svg
              class="h-5 w-5 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <!-- Social -->
          <div class="flex gap-3 pt-3">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-primary/30 hover:bg-primary"
              :aria-label="social.name"
            >
              <svg
                class="h-5 w-5 text-slate-400 transition-colors duration-300 group-hover:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path :d="social.icon" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
        <div v-for="section in quickLinks" :key="section.title" class="space-y-4">
          <h4
            class="text-sm font-bold uppercase tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
          >
            {{ section.title }}
          </h4>

          <ul class="space-y-3">
            <li v-for="link in section.links" :key="link.text">
              <router-link
                :to="link.url"
                class="group inline-flex items-center gap-2 text-sm text-slate-400 transition-colors duration-300 hover:text-white"
              >
                <span class="h-[1px] w-4 bg-secondary opacity-0 transition-all duration-300 group-hover:w-6 group-hover:opacity-100"></span>
                {{ link.text }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div
        class="flex flex-col items-start justify-between gap-5 border-t border-slate-800/60 pt-8 text-sm text-slate-500 md:flex-row md:items-center"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <img class="text-xs font-bold text-white"  src="" />
          </div>
          <p>© {{ currentYear }} Totisoft CC. All rights reserved.</p>
        </div>

        <div class="flex items-center gap-4">
          <a class="flex uppercase text-secondary font-bold items-center justify-center" href="/sitemap.xml">
              Site Map XML
          </a>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <span class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-secondary"></span>
            <span>Web design. Managed support. Structured growth.</span>
          </span>

          <button
            @click="scrollToTop"
            class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:border-primary/30 hover:bg-primary"
            aria-label="Back to top"
          >
            <svg
              class="h-5 w-5 text-slate-400 transition-all duration-300 group-hover:-translate-y-1 group-hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()

const serviceBadges = [
  'Website Packages',
]

const socialLinks = [
  {
    name: 'Facebook',
    url: '',
    icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
  },
  {
    name: 'LinkedIn',
    url: '',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.203 0 22.225 0z'
  }
]

const quickLinks = [
  {
    title: 'Services',
    links: [
      { text: 'Website Packages', url: '/#packages' },
      
    ]
  }, 
  {
    title: 'Solutions',
    links: [
      { text: 'Marketing Websites', url: '/services/marketing' },
      
    ]
  },
  {
    title: 'Company',
    links: [
      { text: 'About Us', url: '/about' },
      { text: 'Our Work', url: '/our_work' },
      { text: 'FAQ', url: '/faq' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Cookie Policy', url: '/cookie-policy' },
    ]
  }
]

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.font-display {
  font-family: 'Space Grotesk', sans-serif;
}

a,
button {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>