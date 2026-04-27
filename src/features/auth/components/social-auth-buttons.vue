<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <button
      type="button"
      :disabled="loading"
      class="group surface-base flex w-full items-center justify-center gap-3 rounded-[1.1rem] px-4 py-3.5 text-sm font-semibold text-[var(--color-text-soft)] transition-theme hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
      @click="$emit('google')"
    >
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path d="M21.99 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.61a4.8 4.8 0 0 1-2.08 3.15v2.62h3.38c1.98-1.82 3.08-4.5 3.08-7.8Z" fill="#4285F4" />
          <path d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.38-2.62c-.94.63-2.14 1-3.25 1-2.5 0-4.63-1.68-5.39-3.95H3.12v2.7A9.99 9.99 0 0 0 12 22Z" fill="#34A853" />
          <path d="M6.61 14c-.2-.63-.31-1.3-.31-2s.11-1.37.31-2V7.3H3.12A9.96 9.96 0 0 0 2 12c0 1.61.38 3.13 1.12 4.7L6.61 14Z" fill="#FBBC05" />
          <path d="M12 6.05c1.47 0 2.78.5 3.81 1.48l2.86-2.86C16.96 3.07 14.7 2 12 2 8.09 2 4.72 4.24 3.12 7.3l3.49 2.7c.76-2.27 2.89-3.95 5.39-3.95Z" fill="#EA4335" />
        </svg>
      </span>
      <span>Google</span>
    </button>

    <button
      type="button"
      :disabled="loading"
      class="group surface-base flex w-full items-center justify-center gap-3 rounded-[1.1rem] px-4 py-3.5 text-sm font-semibold text-[var(--color-text-soft)] transition-theme hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
      @click="$emit('github')"
    >
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.33 6.84 9.68.5.1.68-.22.68-.49 0-.24-.01-1.03-.02-1.87-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.49-1.11-1.49-.9-.64.07-.63.07-.63 1 .08 1.52 1.05 1.52 1.05.89 1.57 2.34 1.12 2.9.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.09 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.79c.85 0 1.7.12 2.5.35 1.9-1.34 2.74-1.06 2.74-1.06.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.77 0 3.96-2.34 4.82-4.57 5.08.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.24 10.24 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
        </svg>
      </span>
      <span>GitHub</span>
    </button>

    <button
      type="button"
      :disabled="loading"
      class="group surface-base flex w-full items-center justify-center gap-3 rounded-[1.1rem] px-4 py-3.5 text-sm font-semibold text-[var(--color-text-soft)] transition-theme hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60"
      @click="$emit('microsoft')"
    >
      <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
        <svg class="h-5 w-5" viewBox="0 0 23 23">
          <path fill="#f35325" d="M1 1h10v10H1z" />
          <path fill="#81bc06" d="M12 1h10v10H12z" />
          <path fill="#05a6f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
      </span>
      <span>Microsoft</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['google', 'github', 'microsoft']);
</script>
