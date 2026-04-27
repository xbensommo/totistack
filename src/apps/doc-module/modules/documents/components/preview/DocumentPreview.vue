<template>
  <div class="space-y-8">
    <PageFrame
      v-for="page in pagePlan.pages"
      :key="page.pageNumber"
      :page="page"
      :document="document"
    />
  </div>
</template>

<script setup>
import PageFrame from './PageFrame.vue';

defineProps({
  document: { type: Object, required: true },
  pagePlan: { type: Object, required: true },
});
</script>
