<script setup>
import { ref, reactive, computed } from 'vue';
import ErrorPage from '@app/components/ErrorPages.vue'
</script>

<template>
  <ErrorPage code="501" message="Not Implemented" description="The server doesn't recognize the request method"/>
</template>