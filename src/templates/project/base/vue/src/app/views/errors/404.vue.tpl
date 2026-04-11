<script setup>
import { ref, reactive, computed } from 'vue';
import ErrorPage from '@app/components/ErrorPages.vue'
</script>

<template>
  <ErrorPage code="404" message="Page Not Found" description="The page you are looking is no longer with us"/>
</template>