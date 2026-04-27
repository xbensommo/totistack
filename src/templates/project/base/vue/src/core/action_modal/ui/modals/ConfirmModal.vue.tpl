<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
        @keydown.esc.prevent="handleCancel"
      >
        <div
          class="w-full max-w-lg rounded-3xl border border-black/10 bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="messageId"
        >
          <div class="border-b border-black/5 px-6 py-5">
            <div class="flex items-start gap-4">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                :class="iconClasses"
              >
                <span class="text-lg font-semibold">!</span>
              </div>
              <div class="min-w-0 flex-1">
                <h2 :id="titleId" class="text-lg font-semibold text-[var(--color-text,#111827)]">
                  {{ request?.title || 'Confirm action' }}
                </h2>
                <p :id="messageId" class="mt-2 text-sm leading-6 text-black/70">
                  {{ request?.message || 'Are you sure you want to continue?' }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="request?.requireTypedConfirmation"
            class="px-6 pt-5"
          >
            <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-black/60">
              Type {{ request?.expectedText || 'CONFIRM' }} to continue
            </label>
            <input
              v-model="typedText"
              type="text"
              class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-[var(--color-primary,#1860A8)]"
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <div class="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 px-4 py-2 text-sm font-medium text-black/80 transition hover:bg-black/[0.03]"
              @click="handleCancel"
            >
              {{ request?.cancelText || 'Cancel' }}
            </button>

            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              :class="confirmButtonClasses"
              :disabled="isConfirmDisabled"
              @click="handleConfirm"
            >
              {{ request?.confirmText || 'Continue' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
/**
 * @file src/core/ui/modals/ConfirmModal.vue
 * @description One global reusable confirmation modal for Totistack.
 */

import { computed, inject, ref, watch } from 'vue';
import { CONFIRM_MODAL_STORE_KEY } from '../../plugins/action-plugin.js';

const titleId = 'totistack-confirm-title';
const messageId = 'totistack-confirm-message';

const modalStore = inject(CONFIRM_MODAL_STORE_KEY, null);

if (!modalStore) {
  throw new Error('ConfirmModal requires CONFIRM_MODAL_STORE_KEY provider.');
}

const typedText = ref('');
const state = modalStore.state;

const isOpen = computed(() => Boolean(state.value?.isOpen));
const request = computed(() => state.value?.request || null);

watch(isOpen, (open) => {
  if (!open) typedText.value = '';
});

const isConfirmDisabled = computed(() => {
  if (!request.value?.requireTypedConfirmation) return false;
  return typedText.value.trim() !== (request.value.expectedText || 'CONFIRM');
});

const iconClasses = computed(() => {
  switch (request.value?.variant) {
    case 'danger':
      return 'bg-red-50 text-red-700';
    case 'warning':
      return 'bg-amber-50 text-amber-700';
    case 'success':
      return 'bg-emerald-50 text-emerald-700';
    default:
      return 'bg-[var(--color-primary,#1860A8)]/10 text-[var(--color-primary,#1860A8)]';
  }
});

const confirmButtonClasses = computed(() => {
  switch (request.value?.variant) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700';
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700';
    case 'success':
      return 'bg-emerald-600 hover:bg-emerald-700';
    default:
      return 'bg-[var(--color-primary,#1860A8)] hover:opacity-90';
  }
});

function handleCancel() {
  modalStore.resolve(false);
}

function handleConfirm() {
  if (isConfirmDisabled.value) return;
  modalStore.resolve(true);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
