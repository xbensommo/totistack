<template>
  <div class="space-y-3">
    <div class="grid gap-3 md:grid-cols-3">
      <label class="block text-sm">
        <span class="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Mode</span>
        <select :value="modelValue.mode" class="field" @change="updateField('mode', $event.target.value)">
          <option value="upload">Upload</option>
          <option value="initials">Initials</option>
          <option value="draw">Draw</option>
        </select>
      </label>

      <label class="block text-sm">
        <span class="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Name</span>
        <input :value="modelValue.name" class="field" @input="updateField('name', $event.target.value)" />
      </label>

      <label class="block text-sm">
        <span class="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Title</span>
        <input :value="modelValue.title" class="field" @input="updateField('title', $event.target.value)" />
      </label>
    </div>

    <label v-if="modelValue.mode === 'upload'" class="block text-sm">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Upload Signature</span>
      <input type="file" accept="image/*" class="field" @change="onFileChange" />
    </label>

    <label v-if="modelValue.mode === 'initials'" class="block text-sm">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Initials</span>
      <input
        :value="modelValue.initials"
        maxlength="8"
        class="field"
        @input="updateField('initials', $event.target.value)"
      />
    </label>

    <div v-if="modelValue.mode === 'draw'" class="space-y-2">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
          @click="openDrawModal"
        >
          Open Signature Pad
        </button>

        <button
          v-if="modelValue.drawnDataUrl"
          type="button"
          class="border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
          @click="clearPad"
        >
          Clear Saved Signature
        </button>
      </div>
    </div>

    <label class="block text-sm">
      <span class="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Signed On</span>
      <input
        :value="modelValue.signedOn"
        type="date"
        class="field"
        @input="updateField('signedOn', $event.target.value)"
      />
    </label>

    <div v-if="previewSource" class="border border-slate-300 bg-slate-50 px-4 py-3">
      <img
        v-if="previewSource.startsWith('data:image')"
        :src="previewSource"
        alt="Signature preview"
        class="max-h-16 object-contain"
      />
      <div v-else class="text-base font-semibold text-slate-900">{{ previewSource }}</div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-3xl border border-slate-300 bg-white">
          <div class="flex items-center justify-between border-b border-slate-300 px-4 py-3">
            <div class="text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">Draw Signature</div>
            <button
              type="button"
              class="border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
              @click="closeDrawModal"
            >
              Close
            </button>
          </div>

          <div class="space-y-3 p-4">
            <canvas
              ref="canvasRef"
              class="signature-pad"
              @pointerdown="startDraw"
              @pointermove="draw"
              @pointerup="stopDraw"
              @pointercancel="stopDraw"
              @pointerleave="stopDraw"
            ></canvas>

            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                class="border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
                @click="clearCanvasOnly"
              >
                Clear
              </button>

              <button
                type="button"
                class="border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
                @click="saveAndClose"
              >
                Save Signature
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { readFileAsDataUrl } from '../../utils/file.js';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue']);

const canvasRef = ref(null);
const isModalOpen = ref(false);
const isDrawing = ref(false);
const lastPoint = ref(null);

let resizeObserver = null;

const previewSource = computed(() => {
  if (props.modelValue.mode === 'upload') return props.modelValue.imageUrl || '';
  if (props.modelValue.mode === 'draw') return props.modelValue.drawnDataUrl || '';
  if (props.modelValue.mode === 'initials') return props.modelValue.initials || '';
  return '';
});

function updateField(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  });
}

async function onFileChange(event) {
  const [file] = Array.from(event.target.files || []);
  if (!file) return;
  const dataUrl = await readFileAsDataUrl(file);
  updateField('imageUrl', dataUrl);
}

function getCanvas() {
  return canvasRef.value;
}

function getContext() {
  const canvas = getCanvas();
  return canvas ? canvas.getContext('2d') : null;
}

function setupContext() {
  const ctx = getContext();
  if (!ctx) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.6;
}

function clearCanvasOnly() {
  const canvas = getCanvas();
  const ctx = getContext();
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearPad() {
  clearCanvasOnly();
  updateField('drawnDataUrl', '');
}

function getPoint(event) {
  const canvas = getCanvas();
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function resizeCanvas() {
  const canvas = getCanvas();
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = Math.max(rect.width, 320);
  const cssHeight = 220;
  const previous = props.modelValue.drawnDataUrl || '';

  canvas.width = Math.floor(cssWidth * ratio);
  canvas.height = Math.floor(cssHeight * ratio);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = getContext();
  if (!ctx) return;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  setupContext();

  if (previous) {
    restoreFromDataUrl(previous);
  } else {
    clearCanvasOnly();
  }
}

function restoreFromDataUrl(dataUrl) {
  const canvas = getCanvas();
  const ctx = getContext();
  if (!canvas || !ctx || !dataUrl) return;

  const img = new Image();
  img.onload = () => {
    const rect = canvas.getBoundingClientRect();
    clearCanvasOnly();
    ctx.drawImage(img, 0, 0, rect.width, rect.height);
  };
  img.src = dataUrl;
}

function startDraw(event) {
  const canvas = getCanvas();
  const ctx = getContext();
  if (!canvas || !ctx) return;

  event.preventDefault();
  canvas.setPointerCapture?.(event.pointerId);

  isDrawing.value = true;
  const point = getPoint(event);
  lastPoint.value = point;

  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
}

function draw(event) {
  const ctx = getContext();
  if (!ctx || !isDrawing.value) return;

  event.preventDefault();

  const point = getPoint(event);
  const previous = lastPoint.value || point;
  const midX = (previous.x + point.x) / 2;
  const midY = (previous.y + point.y) / 2;

  ctx.beginPath();
  ctx.moveTo(previous.x, previous.y);
  ctx.quadraticCurveTo(previous.x, previous.y, midX, midY);
  ctx.stroke();

  lastPoint.value = point;
}

function stopDraw(event) {
  const canvas = getCanvas();
  if (!canvas || !isDrawing.value) return;

  event?.preventDefault();
  canvas.releasePointerCapture?.(event.pointerId);

  isDrawing.value = false;
  lastPoint.value = null;
}

function saveDrawing() {
  const canvas = getCanvas();
  if (!canvas) return;
  updateField('drawnDataUrl', canvas.toDataURL('image/png'));
}

async function openDrawModal() {
  isModalOpen.value = true;

  await nextTick();
  resizeCanvas();

  const canvas = getCanvas();
  if (!canvas) return;

  resizeObserver?.disconnect();
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
  });
  resizeObserver.observe(canvas);
}

function closeDrawModal() {
  resizeObserver?.disconnect();
  resizeObserver = null;
  isModalOpen.value = false;
}

function saveAndClose() {
  saveDrawing();
  closeDrawModal();
}

watch(
  () => props.modelValue.drawnDataUrl,
  (value) => {
    if (!value || isDrawing.value || !isModalOpen.value) return;
    restoreFromDataUrl(value);
  }
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.field {
  width: 100%;
  border: 1px solid #cbd5e1;
  background: white;
  padding: 0.625rem 0.75rem;
}

.signature-pad {
  display: block;
  width: 100%;
  height: 220px;
  border: 1px solid #cbd5e1;
  background: white;
  touch-action: none;
  cursor: crosshair;
}
</style>