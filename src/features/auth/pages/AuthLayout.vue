<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
    <div class="w-full max-w-5xl">
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Authentication</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Starter access system</h1>
        <p class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          These pages are intentionally generic so they can ship as a starter and be extended without rewriting the access runtime.
        </p>
      </div>
      <RouterView />
    </div>
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router';
</script>
