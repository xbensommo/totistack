<script setup>
import { ref, reactive, computed } from 'vue';
import ErrorPage from '@app/components/ErrorPages.vue'
</script>

<template>
  <ErrorPage code="401" message="Unauthorized" description="You are trying to access a page that requires Authentication. You either haven't logged in yet or your session has expired."/>
</template>