<script setup>
import { ref, reactive, computed } from 'vue';
import ErrorPage from '@app/components/ErrorPages.vue'

const hardReset = () => {
  // Clear potential corrupted state and force a reload
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/'; 
};
</script>

<template>
  <ErrorPage code="500" message="Internal Server Error" description="The server encountered an unexpected condition that prevented it from fulfilling the request."/>
</template>