import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useDatabaseManagerStore = defineStore('database-manager', () => {
  // ─── State ───────────────────────────────────────────────────────────────
  const loading = ref(false);
  const error = ref(null);

  // ─── Computed ────────────────────────────────────────────────────────────
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function resetError() {
    error.value = null;
  }

  function withLoading(fn) {
    return async (...args) => {
      loading.value = true;
      error.value = null;
      try {
        return await fn(...args);
      } catch (err) {
        error.value = err.message ?? 'An unexpected error occurred.';
        throw err;
      } finally {
        loading.value = false;
      }
    };
  }

  // ─── Business Logic Actions ───────────────────────────────────────────────
  /**
   * Trigger seeding of a named Firestore collection.
   * @param {string} collectionName  - target Firestore collection path
   * @param {Array<Record<string,unknown>>} seedPayload - documents to write
   * @param {{ merge?: boolean }} options
   */
  const seedCollection = withLoading(async (collectionName, seedPayload = [], options = {}) => {
    if (!collectionName) throw new Error('collectionName is required');
    if (!Array.isArray(seedPayload)) throw new Error('seedPayload must be an array');

    const { getFirestore, collection, writeBatch, doc } = await import('firebase/firestore');
    const db = getFirestore();
    const batchSize = 400; // Firestore max batch = 500; keep headroom

    for (let i = 0; i < seedPayload.length; i += batchSize) {
      const chunk = seedPayload.slice(i, i + batchSize);
      const batch = writeBatch(db);
      chunk.forEach((data) => {
        const ref = data.id
          ? doc(db, collectionName, data.id)
          : doc(collection(db, collectionName));
        options.merge ? batch.set(ref, data, { merge: true }) : batch.set(ref, data);
      });
      await batch.commit();
    }

    return { seeded: seedPayload.length, collection: collectionName };
  });

  /**
   * Inspect a single Firestore document by path.
   * @param {string} docPath - full path e.g. "users/uid123"
   * @returns {Promise<{ id: string, data: Record<string,unknown>, exists: boolean }>}
   */
  const inspectDoc = withLoading(async (docPath) => {
    if (!docPath) throw new Error('docPath is required');

    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const snap = await getDoc(doc(db, docPath));

    return {
      id: snap.id,
      exists: snap.exists(),
      data: snap.exists() ? snap.data() : null
    };
  });

  return {
    // State
    loading,
    error,
    // Computed
    isLoading,
    hasError,
    // Actions
    seedCollection,
    inspectDoc,
    resetError
  };
});

export default useDatabaseManagerStore;
