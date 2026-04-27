<template>
  <footer class="absolute grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 border-t border-slate-300 pt-3 text-[12px] text-slate-500" :style="footerStyle">
    <div>{{ document.layout.footer.leftText }}</div>
    <div class="text-center">{{ document.layout.footer.centerText }}</div>
    <div class="text-right">
      {{ document.layout.footer.rightText }}
      <span v-if="document.layout.footer.showPageNumbers"> · Page {{ pageNumber }} of {{ pageCount }}</span>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  document: { type: Object, required: true },
  pageNumber: { type: Number, default: 1 },
  pageCount: { type: Number, default: 1 },
});

const margins = computed(() => props.document.layout?.margins || { bottom: 40, right: 52, left: 52 });

const footerStyle = computed(() => ({
  left: `${margins.value.left || 0}px`,
  right: `${margins.value.right || 0}px`,
  bottom: `${margins.value.bottom || 0}px`,
}));
</script>
