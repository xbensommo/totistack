<template>
  <div class="flex flex-wrap gap-2 border-b border-slate-200/80 bg-slate-50/90 px-3 py-3">
    <button type="button" class="toolbar-btn !w-auto !min-w-[42px]" @mousedown.prevent="$emit('command', { type: 'formatBlock', value: 'P' })">P</button>
    <button type="button" class="toolbar-btn !w-auto !min-w-[42px]" @mousedown.prevent="$emit('command', { type: 'formatBlock', value: 'H2' })">H2</button>
    <button type="button" class="toolbar-btn !w-auto !min-w-[42px]" @mousedown.prevent="$emit('command', { type: 'bold' })"><strong>B</strong></button>
    <button type="button" class="toolbar-btn !w-auto !min-w-[42px]" @mousedown.prevent="$emit('command', { type: 'italic' })"><em>I</em></button>
    <button type="button" class="toolbar-btn !w-auto !min-w-[42px]" @mousedown.prevent="$emit('command', { type: 'justifyLeft' })"><i class="fa-solid fa-align-left"></i></button>
    <button type="button" class="toolbar-btn !w-auto !min-w-[42px]" @mousedown.prevent="$emit('command', { type: 'justifyCenter' })"><i class="fa-solid fa-align-center"></i></button>
    <button type="button" class="toolbar-btn !w-auto !min-w-[42px]" @mousedown.prevent="$emit('command', { type: 'justifyRight' })"><i class="fa-solid fa-align-right"></i></button>
    <button type="button" class="toolbar-btn !w-auto !min-w-[42px]" @mousedown.prevent="$emit('command', { type: 'justifyFull' })"><i class="fa-solid fa-align-justify"></i></button>
  </div>
</template>

<script setup>
defineEmits(['command']);
</script>
