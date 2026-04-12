/**
 * @file search/stores/searchStore.js
 * @description Lightweight UI-only Pinia store retained for backward compatibility.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchUiStore = defineStore('search-ui', () => {
  const query = ref('')
  const recentQueries = ref([])

  function rememberQuery(value) {
    const next = String(value || '').trim()
    if (!next) return
    recentQueries.value = [next, ...recentQueries.value.filter((item) => item !== next)].slice(0, 10)
    query.value = next
  }

  return {
    query,
    recentQueries,
    rememberQuery,
  }
})
