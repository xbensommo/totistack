<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-5"
    @click.self="$emit('close')"
  >
    <div class="doc-modal-shell flex h-[94vh] w-full max-w-7xl flex-col">
      <div class="border-b border-slate-200/80 px-4 py-4 sm:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="doc-section-kicker">Final Output</p>
            <h3 class="mt-2 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">{{ title }}</h3>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <a
              v-if="pdfUrl"
              class="doc-btn doc-btn--soft sm:w-auto"
              :href="pdfUrl"
              target="_blank"
              rel="noopener"
            >
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              Open in New Page
            </a>

            <a
              v-if="pdfUrl"
              class="doc-btn doc-btn--primary sm:w-auto"
              :href="pdfUrl"
              :download="`${fileName}.pdf`"
            >
              <i class="fa-solid fa-file-arrow-down"></i>
              Download
            </a>

            <button class="doc-btn doc-btn--soft sm:w-auto" type="button" @click="$emit('close')">
              <i class="fa-solid fa-xmark"></i>
              Close
            </button>
          </div>
        </div>
      </div>

      <div class="min-h-0 flex-1 bg-slate-100/80 p-3 sm:p-4">
        <div class="h-full overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <iframe
            v-if="pdfUrl"
            class="h-full w-full bg-white"
            :src="pdfUrl"
            title="Final PDF Preview"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  pdfUrl: { type: String, default: '' },
  title: { type: String, default: 'Document PDF Preview' },
  fileName: { type: String, default: 'document' },
});

defineEmits(['close']);
</script>
