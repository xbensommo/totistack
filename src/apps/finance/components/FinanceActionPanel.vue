<template>
  <section class="rounded-[24px] border border-[var(--color-neutral-dark,#E2E8F0)] bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-[var(--color-text,#0F172A)]">
          {{ title }}
        </h3>
        <p class="text-sm leading-6 text-[var(--color-text-light,#64748B)]">
          {{ description }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          v-if="showReview"
          type="button"
          class="inline-flex items-center justify-center rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-2 text-sm font-semibold text-[var(--color-text,#0F172A)] transition hover:border-[var(--color-secondary,#4A90E2)] hover:text-[var(--color-secondary,#4A90E2)]"
          @click="request('review')"
        >
          Review
        </button>

        <button
          v-if="showPost"
          type="button"
          class="inline-flex items-center justify-center rounded-2xl bg-[var(--color-accent,#000000)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          @click="request('post')"
        >
          Post
        </button>

        <button
          v-if="showReverse"
          type="button"
          class="inline-flex items-center justify-center rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          @click="request('reverse')"
        >
          Reverse
        </button>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <div
      v-if="localDialog.open"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 px-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-[28px] border border-white/10 bg-white p-6 shadow-2xl">
        <div class="space-y-3">
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-primary,#1860A8)]">
            Confirm Action
          </p>
          <h4 class="text-2xl font-semibold tracking-tight text-[var(--color-text,#0F172A)]">
            {{ localDialog.title }}
          </h4>
          <p class="text-sm leading-7 text-[var(--color-text-light,#64748B)]">
            {{ localDialog.message }}
          </p>
        </div>

        <div class="mt-8 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl border border-[var(--color-neutral-dark,#E2E8F0)] px-4 py-2 text-sm font-semibold text-[var(--color-text,#0F172A)] transition hover:bg-[var(--color-neutral,#F8FAFC)]"
            @click="closeDialog"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl bg-[var(--color-accent,#000000)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            @click="confirmLocalAction"
          >
            {{ localDialog.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * @file src/apps/finance/components/FinanceActionPanel.vue
 * @description Finance action panel with built-in confirm modal and optional host executor bridge.
 */

import { inject, reactive } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Finance action',
  },
  description: {
    type: String,
    default: 'Confirm sensitive finance actions before they change the ledger.',
  },
  showReview: {
    type: Boolean,
    default: false,
  },
  showPost: {
    type: Boolean,
    default: false,
  },
  showReverse: {
    type: Boolean,
    default: false,
  },
  confirmAction: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['review', 'post', 'reverse'])
const confirmModalStore = inject('totistack:confirm-modal-store', null)

const localDialog = reactive({
  open: false,
  action: null,
  title: '',
  message: '',
  confirmText: 'Confirm',
})

const actionConfig = {
  review: {
    title: 'Review transaction',
    message: 'This marks the transaction as reviewed and ready for posting.',
    confirmText: 'Review transaction',
  },
  post: {
    title: 'Post transaction',
    message: 'This will create ledger impact and surface the record in finance reports.',
    confirmText: 'Post transaction',
  },
  reverse: {
    title: 'Reverse journal entry',
    message: 'This creates a reversal entry and preserves the audit trail.',
    confirmText: 'Reverse entry',
  },
}

function closeDialog() {
  localDialog.open = false
  localDialog.action = null
}

async function request(action) {
  const config = actionConfig[action]
  if (!config) return

  if (typeof props.confirmAction === 'function') {
    const approved = await props.confirmAction(config)
    if (approved) emit(action)
    return
  }

  if (confirmModalStore && typeof confirmModalStore.open === 'function') {
    const approved = await confirmModalStore.open(config)
    if (approved) emit(action)
    return
  }

  localDialog.open = true
  localDialog.action = action
  localDialog.title = config.title
  localDialog.message = config.message
  localDialog.confirmText = config.confirmText
}

function confirmLocalAction() {
  if (localDialog.action) {
    emit(localDialog.action)
  }
  closeDialog()
}
</script>
