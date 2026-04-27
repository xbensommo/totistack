<template>
  <div class="doc-studio-shell documents-app-theme">
    <div class="doc-studio-grid">
      <aside class="doc-studio-pane doc-studio-sidebar border-b xl:border-b-0 xl:border-r">
        <div class="doc-studio-pane-head">
          <div class="doc-hero-card">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="doc-section-kicker">{{ badgeLabel }}</p>
                <h1 class="doc-display-title mt-2 text-2xl font-bold tracking-tight">{{ title }}</h1>
                <p class="doc-copy mt-2 max-w-xl text-sm leading-6">{{ subtitle }}</p>
              </div>

              <StatusBadge :status="normalizedDocument.meta.status" />
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <div class="doc-metric-card">
                <div class="doc-eyebrow text-[11px] font-semibold uppercase tracking-[0.14em]">Type</div>
                <div class="doc-emphasis mt-2 text-sm font-semibold">{{ definition?.label || 'Unknown' }}</div>
              </div>
              <div class="doc-metric-card">
                <div class="doc-eyebrow text-[11px] font-semibold uppercase tracking-[0.14em]">Status</div>
                <div class="doc-emphasis mt-2 text-sm font-semibold first-letter:uppercase">{{ normalizedDocument.meta.status }}</div>
              </div>
              <div class="doc-metric-card">
                <div class="doc-eyebrow text-[11px] font-semibold uppercase tracking-[0.14em]">Pages</div>
                <div class="doc-emphasis mt-2 text-sm font-semibold">{{ pagePlan.pages.length }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="doc-studio-pane-body">
          <section v-if="validationErrors.length" class="doc-validation-card doc-feedback doc-feedback--danger mb-4 text-sm">
            <div class="mb-3 flex items-center gap-2">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <div class="text-xs font-bold uppercase tracking-[0.14em]">Validation issues</div>
            </div>
            <ul class="list-disc space-y-1.5 pl-5">
              <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
          </section>

          <section class="doc-action-card mb-4">
            <div class="grid gap-4 md:grid-cols-2">
              <label class="block text-sm md:col-span-2">
                <span class="field-label">Document Type</span>
                <select v-model="selectedType" class="field">
                  <option v-for="entry in documentDefinitions" :key="entry.id" :value="entry.id">
                    {{ entry.label }}
                  </option>
                </select>
              </label>
            </div>
          </section>

          <EditorPanels
            :document-draft="documentDraft"
            :definition="definition"
            :normalized-document="normalizedDocument"
            @add-rich-block="addRichBlock"
            @remove-rich-block="removeRichBlock"
            @add-list-item="addListItem"
            @remove-list-item="removeListItem"
            @add-line-item="addLineItem"
            @remove-line-item="removeLineItem"
          />
        </div>
      </aside>

      <main class="doc-studio-pane doc-studio-preview-pane">
        <div class="doc-toolbar">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p class="doc-section-kicker">Live Preview</p>
              <h2 class="doc-display-title mt-2 text-2xl font-bold tracking-tight">{{ normalizedDocument.meta.number || 'Draft' }}</h2>
              <p class="doc-copy mt-2 text-sm leading-6">{{ normalizedDocument.meta.title }}</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button class="doc-btn doc-btn--primary sm:w-auto" type="button" :disabled="loading" @click="generatePdfFile">
                <i class="fa-solid fa-file-pdf"></i>
                {{ loading ? 'Generating PDF...' : 'Generate PDF' }}
              </button>
              <button class="doc-btn doc-btn--soft sm:w-auto" type="button" @click="handleValidate">
                <i class="fa-solid fa-shield-check"></i>
                Validate
              </button>
            </div>
          </div>

          <div class="doc-toolbar-stats mt-5">
            <div class="doc-toolbar-stat">
              <div class="doc-eyebrow text-[11px] font-semibold uppercase tracking-[0.14em]">Sections</div>
              <div class="doc-emphasis mt-2 text-base font-semibold">{{ sectionCount }}</div>
            </div>
            <div class="doc-toolbar-stat">
              <div class="doc-eyebrow text-[11px] font-semibold uppercase tracking-[0.14em]">Validation</div>
              <div class="mt-2 text-base font-semibold" :class="validationErrors.length ? 'doc-feedback-text--danger' : 'doc-feedback-text--success'">
                {{ validationErrors.length ? `${validationErrors.length} issue(s)` : 'Ready' }}
              </div>
            </div>
            <div v-if="showTotalsChip" class="doc-toolbar-stat">
              <div class="doc-eyebrow text-[11px] font-semibold uppercase tracking-[0.14em]">Total</div>
              <div class="doc-emphasis mt-2 text-base font-semibold">{{ money(normalizedDocument.finance.total) }}</div>
            </div>
          </div>
        </div>

        <div class="doc-preview-scroll">
          <div class="doc-page-wrap">
            <DocumentPreview :document="normalizedDocument" :page-plan="pagePlan" />
          </div>
        </div>
      </main>

      <aside class="doc-studio-pane doc-studio-inspector border-t xl:border-t-0 xl:border-l">
        <div class="doc-studio-pane-head">
          <div class="doc-hero-card">
            <p class="doc-section-kicker">Output</p>
            <h2 class="doc-display-title mt-2 text-xl font-bold tracking-tight">Final export</h2>
            <p class="doc-copy mt-2 text-sm leading-6">
              Generate, inspect, open, and download without leaving the studio.
            </p>
          </div>
        </div>

        <div class="doc-studio-pane-body space-y-4">
          <div class="doc-action-card">
            <div class="space-y-3">
              <button class="doc-btn doc-btn--dark" type="button" :disabled="!pdfUrl" @click="openPdfModal">
                <i class="fa-solid fa-expand"></i>
                Preview Final PDF
              </button>

              <button class="doc-btn doc-btn--soft" type="button" :disabled="!pdfUrl" @click="openPdfInNewTab">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                Open in New Tab
              </button>

              <button class="doc-btn doc-btn--soft" type="button" :disabled="!pdfUrl" @click="downloadPdf">
                <i class="fa-solid fa-file-arrow-down"></i>
                Download PDF
              </button>

              <button class="doc-btn doc-btn--soft" type="button" @click="resetCurrentDocument">
                <i class="fa-solid fa-rotate-left"></i>
                Reset Draft
              </button>
            </div>
          </div>

          <div class="doc-action-card">
            <div class="doc-copy space-y-3 text-sm">
              <div class="flex items-center justify-between gap-4">
                <span>Document</span>
                <strong class="doc-emphasis">{{ normalizedDocument.meta.type }}</strong>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span>Currency</span>
                <strong class="doc-emphasis">{{ normalizedDocument.meta.currency }}</strong>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span>Pages</span>
                <strong class="doc-emphasis">{{ pagePlan.pages.length }}</strong>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span>Blocks</span>
                <strong class="doc-emphasis">{{ sectionCount }}</strong>
              </div>
            </div>
          </div>

          <div class="doc-action-card">
            <p class="doc-eyebrow text-xs font-semibold uppercase tracking-[0.14em]">Studio notes</p>
            <p class="doc-helper-note mt-3">
              This shell is now designed for Totistack-style three-pane workflows: editor, live preview, and final export,
              each with its own scroll area on large screens.
            </p>
          </div>

          <p v-if="error" class="doc-feedback doc-feedback--danger rounded-2xl px-4 py-3 text-sm font-medium">{{ error }}</p>
          <p v-else-if="exportMessage" class="doc-feedback doc-feedback--success rounded-2xl px-4 py-3 text-sm font-medium">{{ exportMessage }}</p>
        </div>
      </aside>
    </div>

    <DocumentPdfModal
      :open="isPdfModalOpen"
      :pdf-url="pdfUrl"
      :title="`${normalizedDocument.meta.title} · ${normalizedDocument.meta.number || 'Draft'}`"
      :file-name="safeFileName"
      @close="isPdfModalOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import './styles/studio.css';
import StatusBadge from './components/shared/StatusBadge.vue';
import EditorPanels from './components/editor/EditorPanels.vue';
import DocumentPreview from './components/preview/DocumentPreview.vue';
import DocumentPdfModal from './components/PdfModal.vue';
import { useDocumentStudio } from './composables/useDocumentStudio.js';
import { createBusinessDocumentPdfUrl } from './export/createPdfFile.js';
import { formatMoney } from './utils/money.js';

const props = defineProps({
  initialType: {
    type: String,
    default: 'contract',
  },
  definitions: {
    type: Array,
    default: () => [],
  },
  badgeLabel: {
    type: String,
    default: 'DocForge',
  },
  title: {
    type: String,
    default: 'Document Studio',
  },
  subtitle: {
    type: String,
    default: 'Enterprise-style editor with live preview, PDF generation, and clean Totistack integration points.',
  },
});

const {
  documentDefinitions,
  selectedType,
  definition,
  documentDraft,
  normalizedDocument,
  pagePlan,
  validationErrors,
  validate,
  addRichBlock,
  removeRichBlock,
  addListItem,
  removeListItem,
  addLineItem,
  removeLineItem,
  resetCurrentDocument,
} = useDocumentStudio(props.initialType, {
  definitions: props.definitions,
});

const pdfUrl = ref('');
const isPdfModalOpen = ref(false);
const loading = ref(false);
const error = ref('');
const exportMessage = ref('');

const sectionCount = computed(() => pagePlan.value.pages.reduce((sum, page) => sum + (page.sections?.length || 0), 0));
const showTotalsChip = computed(() => ['invoice', 'quotation', 'receipt'].includes(normalizedDocument.value.meta.type));
const safeFileName = computed(() => String(normalizedDocument.value.meta.number || normalizedDocument.value.meta.title || 'document')
  .replace(/[^\w-]+/g, '_')
  .replace(/^_+|_+$/g, '') || 'document');

function handleValidate() {
  validate();
}

async function generatePdfFile() {
  loading.value = true;
  error.value = '';
  exportMessage.value = '';

  try {
    validate();

    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = '';
    }

    pdfUrl.value = await createBusinessDocumentPdfUrl({
      document: normalizedDocument.value,
      pagePlan: pagePlan.value,
    });

    exportMessage.value = 'PDF ready.';
    isPdfModalOpen.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

function openPdfModal() {
  if (!pdfUrl.value) return;
  isPdfModalOpen.value = true;
}

function openPdfInNewTab() {
  if (!pdfUrl.value) return;
  window.open(pdfUrl.value, '_blank', 'noopener,noreferrer');
}

function downloadPdf() {
  if (!pdfUrl.value) return;

  const anchor = document.createElement('a');
  anchor.href = pdfUrl.value;
  anchor.download = `${safeFileName.value}.pdf`;
  anchor.click();
}

function money(value) {
  return formatMoney(value, normalizedDocument.value.meta.currency);
}

onBeforeUnmount(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }
});
</script>
