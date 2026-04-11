<template>
  <div>
    <AppOverlay v-if="false" />
    <Toaster position="top-center" richColors />
    <RouterView />
    <Cookie />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import {  RouterView } from "vue-router";
import { Toaster, toast } from 'vue-sonner';

import AppOverlay from '@app/components/Overlay.vue';
import Cookie from "@app/components/CookieBanner.vue"
import { useAppStore } from '@app/stores/appStore'

const store = useAppStore(); 

onMounted(() => {
  console.log('{{appName}} v{{projectVersion}} - Ready');
});

// 3. Error Monitoring: Auto-toast errors from the global state
watch(() => store.error, (newError) => {
  if (newError) {
    toast.error("Security Alert", {
      description: typeof newError === 'string' ? newError : newError.message,
    });
  }
});
</script>
