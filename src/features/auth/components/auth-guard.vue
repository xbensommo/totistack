<template>
  <div v-if="loading" class="flex min-h-screen items-center justify-center px-4 py-10">
    <div class="surface-glass rounded-[2rem] px-8 py-10 text-center shadow-theme-md">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-theme-glow">
        <svg class="h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4Zm2 5.29A7.97 7.97 0 0 1 4 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65Z" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-[var(--color-text)]">Checking authentication...</p>
      <p class="mt-2 text-sm text-muted">Please wait while your access is verified.</p>
    </div>
  </div>

  <slot v-else-if="isAuthenticated" />

  <slot v-else name="unauthorized">
    <div class="flex min-h-screen items-center justify-center px-4 py-10">
      <div class="hero-panel w-full max-w-lg text-center">
        <p class="section-label mx-auto mb-4">Restricted area</p>
        <h2 class="mb-3 text-3xl font-bold text-[var(--color-text)]">Access denied</h2>
        <p class="mx-auto mb-8 max-w-md text-sm leading-7 text-muted">
          You need to be signed in before you can view this page.
        </p>
        <router-link
          :to="{ name: 'auth.login', query: { redirect: $route.fullPath } }"
          class="btn-primary inline-flex px-6"
        >
          Sign in
        </router-link>
      </div>
    </div>
  </slot>
</template>

<script setup>
import { useAuth } from '../hooks/use-auth';

const { isAuthenticated, loading } = useAuth();
</script>
