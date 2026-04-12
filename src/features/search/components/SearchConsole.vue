<template>
  <form class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row" @submit.prevent="$emit('search', query)">
    <input v-model="query" type="search" class="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3" :placeholder="placeholder" />
    <button type="submit" class="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Search</button>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
/** @file search/components/SearchConsole.vue */
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search titles, summaries, or indexed content' },
})
const emit = defineEmits(['update:modelValue', 'search'])
const query = ref(props.modelValue)
watch(() => props.modelValue, (value) => { query.value = value })
watch(query, (value) => emit('update:modelValue', value))
</script>
