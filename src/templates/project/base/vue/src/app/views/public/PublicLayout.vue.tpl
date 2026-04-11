<template>
  <div class="min-h-screen bg-[var(--color-bg-canvas)] flex flex-col">
    <NavigationBar />
    
    <main class="flex-grow pt-24 md:pt-32">
      <router-view v-slot="{ Component }">
        <transition 
          mode="out-in"
          @enter="onPageEnter"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <FooterSection />
  </div>
</template>

<script setup>
import NavigationBar from '@app/components/NavigationBar.vue';
import FooterSection from '@app/components/FooterSection.vue';
import gsap from 'gsap';

// Awwwards-Level Page Transition Logic
const onPageEnter = (el) => {
  gsap.fromTo(el, 
    { opacity: 0, y: 20 }, 
    { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }
  );
};
</script>