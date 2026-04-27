<template>
  <main class="auth-shell">
    <section class="auth-brand-panel">
      <div class="relative z-10 flex w-full flex-col justify-between">
        <div class="max-w-xl">
          <p class="section-label mb-5 border-white/10 bg-white/10 text-white">Totistack access</p>
          <h1 class="display-section max-w-lg text-white md:text-6xl">
            Premium authentication for modern Totistack apps.
          </h1>
          <p class="mt-6 max-w-xl text-base leading-8 text-white/72 md:text-lg">
            Clean starter pages, polished defaults, and a visual system that inherits directly from your project theme.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <article class="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <p class="text-caption text-white/55">Starter quality</p>
            <p class="mt-2 text-sm font-semibold text-white">Ready for auth, profile, reset, and social access flows.</p>
          </article>
          <article class="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <p class="text-caption text-white/55">Theme aligned</p>
            <p class="mt-2 text-sm font-semibold text-white">Built to inherit your existing token-based design system.</p>
          </article>
          <article class="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <p class="text-caption text-white/55">Production base</p>
            <p class="mt-2 text-sm font-semibold text-white">Strong first impression without touching runtime logic.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="auth-form-panel bg-hero-gradient">
      <div class="w-full max-w-xl">
        <div class="mb-8 text-center lg:hidden">
          <p class="section-label mb-4">Authentication</p>
          <h1 class="page-title">Starter access system</h1>
          <p class="page-subtitle mx-auto mt-3">
            These pages stay generic, elegant, and easy to extend across Totistack projects.
          </p>
        </div>
        <RouterView />
      </div>
    </section>
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router';
</script>
