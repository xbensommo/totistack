<template>
  <div class="doc-page-shadow">
    <article class="doc-page-frame" :style="pageStyle">
      <div
        v-if="document.layout.watermark?.text"
        class="pointer-events-none absolute inset-0 flex items-center justify-center font-extrabold uppercase tracking-[0.45em] text-slate-200"
        :style="watermarkStyle"
      >
        {{ document.layout.watermark.text }}
      </div>

      <PreviewHeader v-if="document.layout.header?.enabled" :document="document" />

      <div class="absolute overflow-hidden" :style="bodyStyle">
        <PreviewSection
          v-for="(section, index) in page.sections"
          :key="`${page.pageNumber}-${index}`"
          :section="section"
          :document="document"
        />
      </div>

      <PreviewFooter
        v-if="document.layout.footer?.enabled"
        :document="document"
        :page-number="page.pageNumber"
        :page-count="page.pageCount"
      />
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PreviewHeader from './PreviewHeader.vue';
import PreviewFooter from './PreviewFooter.vue';
import PreviewSection from './PreviewSection.vue';
import { PAGE_DIMENSIONS } from '../../core/constants.js';

const props = defineProps({
  page: { type: Object, required: true },
  document: { type: Object, required: true },
});

const pageDimensions = computed(() => PAGE_DIMENSIONS[props.document.layout?.pageSize || 'A4'] || PAGE_DIMENSIONS.A4);
const margins = computed(() => props.document.layout?.margins || { top: 40, right: 52, bottom: 40, left: 52 });
const headerHeight = computed(() => props.document.layout?.header?.enabled ? Number(props.document.layout?.header?.height || 0) : 0);
const footerHeight = computed(() => props.document.layout?.footer?.enabled ? Number(props.document.layout?.footer?.height || 0) : 0);

const pageStyle = computed(() => {
  const width = Number(props.document?.layout?.page?.width || 794);
  const height = Number(props.document?.layout?.page?.height || 1123);

  return {
    width: '100%',
    maxWidth: `${width}px`,
    minHeight: `${height}px`,
  };
});

const bodyStyle = computed(() => ({
  top: `${(margins.value.top || 0) + headerHeight.value}px`,
  left: `${margins.value.left || 0}px`,
  right: `${margins.value.right || 0}px`,
  bottom: `${(margins.value.bottom || 0) + footerHeight.value}px`,
}));

const watermarkStyle = computed(() => ({
  opacity: props.document.layout.watermark.opacity,
  transform: `rotate(${props.document.layout.watermark.rotation}deg)`,
  fontSize: `${Math.max(48, Math.round(pageDimensions.value.width * 0.08))}px`,
}));
</script>
