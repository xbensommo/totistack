/**
 * @file useAsyncState.js
 * @description Composable for managing async state
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ref, readonly } from 'vue';

export function useAsyncState(asyncFn, initialData = null) {
  const loading = ref(false);
  const data = ref(initialData);
  const error = ref(null);
  
  const execute = async (...args) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await asyncFn(...args);
      data.value = result;
      return result;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    loading: readonly(loading),
    data: readonly(data),
    error: readonly(error),
    execute
  };
}