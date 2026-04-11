<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
    <div class="text-center">
      <svg class="animate-spin h-12 w-12 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p class="mt-2 text-sm text-gray-600">Checking authentication...</p>
    </div>
  </div>
  <slot v-else-if="isAuthenticated" />
  <slot v-else name="unauthorized">
    <div class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p class="text-gray-600 mb-6">You need to be logged in to view this page</p>
        <router-link
          :to="{ name: 'auth.login', query: { redirect: $route.fullPath } }"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
        >
          Sign In
        </router-link>
      </div>
    </div>
  </slot>
</template>

<script setup>
import { computed } from 'vue';
import { useAuth } from '../hooks/use-auth';

const { isAuthenticated, loading } = useAuth();
</script>