<template>
  <nav
    ref="navbar"
    class="fixed top-0 w-full z-[100] transition-all duration-700 px-4 sm:px-6 md:px-10 lg:px-16"
    :class="[
      scrolled
        ? 'py-3 sm:py-4 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-lg shadow-slate-200/20'
        : 'py-4 sm:py-5 md:py-7 bg-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto flex justify-between items-center gap-4">
      <router-link to="/" class="relative group z-[110] shrink-0" aria-label="Totisoft Home">
        <div class="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
        <div class="relative rounded-2xl p-1">
          <img
            src="#"
            class="w-12 sm:w-14 md:w-16 lg:w-20 h-auto rounded-xl transition-all duration-500 group-hover:scale-110"
            alt="Totisoft CC Logo"
          />
        </div>
      </router-link>

      <div class="hidden md:flex items-center gap-5 lg:gap-8">
        <div class="flex items-center gap-5 lg:gap-7 px-5 lg:px-8 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-lg">
          <router-link
            v-for="link in navLinks"
            :key="link.name"
            :to="link.href"
            class="relative text-[10px] lg:text-xs font-bold uppercase tracking-[0.18em] lg:tracking-[0.2em] text-slate-600 hover:text-primary transition-colors duration-300 py-2 group whitespace-nowrap"
          >
            {{ link.name }}
            <span class="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-secondary transition-all duration-500 group-hover:w-full"></span>
          </router-link>
        </div>

        <router-link
          to="/assessment"
          class="group relative px-5 lg:px-8 py-3 overflow-hidden rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold uppercase tracking-[0.18em] text-[10px] lg:text-xs shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 whitespace-nowrap"
        >
          <span class="relative z-10">Start Assessment</span>
        </router-link>
      </div>

      <button
        @click="toggleMenu"
        aria-label="Toggle Navigation"
        :aria-expanded="isMenuOpen.toString()"
        aria-controls="mobile-navigation"
        class="md:hidden flex flex-col gap-1.5 z-[110] relative w-11 h-11 items-center justify-center rounded-full bg-white border border-slate-200/50 shadow-md shrink-0"
      >
        <span
          class="w-5 h-0.5 bg-slate-800 transition-all duration-300 origin-center"
          :class="{ 'rotate-45 translate-y-2 !bg-primary': isMenuOpen }"
        ></span>
        <span
          class="w-5 h-0.5 bg-slate-800 transition-all duration-300"
          :class="{ 'opacity-0 scale-x-0': isMenuOpen }"
        ></span>
        <span
          class="w-5 h-0.5 bg-slate-800 transition-all duration-300 origin-center"
          :class="{ '-rotate-45 -translate-y-2 !bg-primary': isMenuOpen }"
        ></span>
      </button>
    </div>
  </nav>

  <Teleport to="body">
    <Transition
      @enter="onMenuEnter"
      @leave="onMenuLeave"
      :css="false"
    >
      <div
        v-if="isMenuOpen"
        id="mobile-navigation"
        class="fixed inset-0 bg-white z-[999] flex flex-col pt-28 sm:pt-32 px-6 sm:px-8 overflow-y-auto"
      >
        <div class="absolute inset-0 pointer-events-none opacity-30">
          <div class="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 -left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>

        <div class="flex flex-col gap-5 sm:gap-6 relative z-10">
          <router-link
            v-for="link in navLinks"
            :key="link.name"
            :to="link.href"
            @click="toggleMenu"
            class="nav-item-mobile text-3xl sm:text-4xl font-bold tracking-tighter text-slate-800 hover:text-primary transition-colors leading-none"
          >
            {{ link.name }}
          </router-link>

          <router-link
            to="/assessment"
            @click="toggleMenu"
            class="nav-item-mobile text-3xl sm:text-4xl font-bold tracking-tighter text-primary leading-none"
          >
            Start Assessment
          </router-link>
        </div>

        <div class="mt-auto pb-10 pt-10 border-t border-slate-100 relative z-10">
          <span class="text-[10px] uppercase tracking-widest text-slate-400 block mb-6">
            Connect with us
          </span>

          <div class="space-y-4">
            <a
              href="mailto:info@totisoft.com"
              class="text-base sm:text-xl font-medium text-slate-700 flex items-center gap-3 break-all"
            >
              <i class="fa fa-envelope text-primary"></i>
              info@totisoft.com
            </a>

            <div class="flex gap-4">
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Totisoft on LinkedIn"
                class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all"
              >
                <i class="fa-brands fa-linkedin-in"></i>
              </a>

              <a
                href="facebook"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Totisoft on Facebook"
                class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all"
              >
                <i class="fa-brands fa-facebook-f"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const scrolled = ref(false)
const isMenuOpen = ref(false)

const navLinks = [
  
  { name: 'Packages', href: '/#packages' },
  
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

const onMenuEnter = (el, done) => {
  const items = el.querySelectorAll('.nav-item-mobile')

  gsap.set(el, { opacity: 0 })
  gsap.set(items, { x: -30, opacity: 0 })

  const tl = gsap.timeline({ onComplete: done })

  tl.to(el, {
    opacity: 1,
    duration: 0.35,
    ease: 'power2.out'
  }).to(items, {
    x: 0,
    opacity: 1,
    stagger: 0.08,
    duration: 0.45,
    ease: 'power3.out'
  }, '-=0.15')
}

const onMenuLeave = (el, done) => {
  gsap.to(el, {
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: done
  })
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.nav-item-mobile {
  font-family: var(--font-display);
}

.backdrop-blur-md {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
</style>