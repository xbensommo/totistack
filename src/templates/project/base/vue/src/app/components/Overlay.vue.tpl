<template>
  <Transition name="fade">
    <div
      v-if="store.isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
    >
      <div class="animate-spin h-14 w-14 rounded-full border-4 border-t-transparent border-[var(--color-primary)]"></div>
    </div>
  </Transition>
</template>

<script setup>
import { useAppStore } from '@app/stores/appStore'
const store = useAppStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, 
.fade-leave-to {
  opacity: 0;
}
</style>
