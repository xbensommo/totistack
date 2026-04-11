<script setup>
import { ref, reactive, computed } from 'vue';
import ErrorPage from '@app/components/ErrorPages.vue'
</script>

<template>
  <ErrorPage code="400" message="Bad Request" description="The server can't understand the request."/>
</template>
