/**
 * @file useAsyncState.js
 * @description Async state management composable
 * @date 2026-03-22
 * @author Totistack Team
 */

import { ref, readonly } from 'vue';

export function useAsyncState(asyncFunction, initialData = null, options = {}) {
  const loading = ref(false);
  const data = ref(initialData);
  const error = ref(null);
  const success = ref(false);
  
  const execute = async (...args) => {
    loading.value = true;
    error.value = null;
    success.value = false;
    
    try {
      const result = await asyncFunction(...args);
      data.value = result;
      success.value = true;
      return result;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const reset = () => {
    loading.value = false;
    data.value = initialData;
    error.value = null;
    success.value = false;
  };
  
  if (options.autoExecute) {
    execute().catch(() => {});
  }
  
  return {
    loading: readonly(loading),
    data: readonly(data),
    error: readonly(error),
    success: readonly(success),
    execute,
    reset
  };
}