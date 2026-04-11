<!--
  @file {{componentName}}ListPage.vue
  @description List page for {{collectionName}} collection
  @date 2026-03-22
  @author Totistack Team
-->

<template>
  <div class="collection-list-page">
    <div class="page-header">
      <h1>{{labelPlural}}</h1>
      <button 
        v-if="canCreate"
        class="btn-primary"
        @click="navigateToCreate"
      >
        Create {{label}}
      </button>
    </div>
    
    <!-- Filters -->
    <div class="filters-bar">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="`Search ${labelPlural}...`"
        class="search-input"
        @input="debouncedSearch"
      />
      
      <select v-model="statusFilter" class="filter-select" @change="applyFilters">
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      
      <button class="btn-secondary" @click="clearFilters">
        Clear Filters
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading {{labelPlural}}...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button class="btn-secondary" @click="retry">Retry</button>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="empty-state">
      <p>No {{labelPlural}} found.</p>
      <button v-if="canCreate" class="btn-primary" @click="navigateToCreate">
        Create your first {{label}}
      </button>
    </div>
    
    <!-- Items Table -->
    <div v-else class="items-table-container">
      <table class="items-table">
        <thead>
          <tr>
            <th v-for="column in listColumns" :key="column.key" @click="sortBy(column.key)">
              {{ column.label }}
              <span v-if="sortField === column.key" class="sort-indicator">
                {{ sortOrder === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td v-for="column in listColumns" :key="column.key">
              <component 
                :is="getColumnComponent(column)"
                :value="item[column.key]"
                :item="item"
                :field="column"
              />
            </td>
            <td class="actions">
              <button 
                class="btn-icon"
                title="View Details"
                @click="viewItem(item.id)"
              >
                👁️
              </button>
              <button 
                v-if="canEdit"
                class="btn-icon"
                title="Edit"
                @click="editItem(item.id)"
              >
                ✏️
              </button>
              <button 
                v-if="canDelete"
                class="btn-icon danger"
                title="Delete"
                @click="confirmDelete(item)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          class="page-button"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          class="page-button"
        >
          Next
        </button>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <Modal 
      v-if="showDeleteModal"
      title="Confirm Delete"
      @close="showDeleteModal = false"
    >
      <p>Are you sure you want to delete this {{label}}?</p>
      <p class="warning-text">This action cannot be undone.</p>
      <template #footer>
        <button class="btn-secondary" @click="showDeleteModal = false">
          Cancel
        </button>
        <button class="btn-danger" @click="deleteItem">
          Delete
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { use{{componentName}}Store } from '../store.js';
import Modal from '@/shared/ui/Modal.vue';
import { useAuthStore } from '@/app/stores/auth.store.js';
import { useDebounce } from '@/core/composables/useDebounce.js';

const router = useRouter();
const store = use{{componentName}}Store();
const authStore = useAuthStore();

// Local state
const searchQuery = ref('');
const statusFilter = ref('all');
const showDeleteModal = ref(false);
const itemToDelete = ref(null);
const sortField = ref('createdAt');
const sortOrder = ref('desc');

// Computed
const label = '{{label}}';
const labelPlural = '{{labelPlural}}';
const listColumns = {{listColumns}};
const canCreate = computed(() => authStore.hasPermission('create_{{collectionName}}'));
const canEdit = computed(() => authStore.hasPermission('edit_{{collectionName}}'));
const canDelete = computed(() => authStore.hasPermission('delete_{{collectionName}}'));
const loading = computed(() => store.loading);
const error = computed(() => store.error);
const items = computed(() => store.items);
const currentPage = computed(() => store.pagination.page);
const itemsPerPage = computed(() => store.pagination.limit);
const totalItems = computed(() => store.pagination.total);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// Methods
function navigateToCreate() {
  router.push(`/{{routePath}}/create`);
}

function viewItem(id) {
  router.push(`/{{routePath}}/${id}`);
}

function editItem(id) {
  router.push(`/{{routePath}}/${id}/edit`);
}

function confirmDelete(item) {
  itemToDelete.value = item;
  showDeleteModal.value = true;
}

async function deleteItem() {
  if (itemToDelete.value) {
    await store.deleteItem(itemToDelete.value.id);
    showDeleteModal.value = false;
    itemToDelete.value = null;
  }
}

function sortBy(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
  fetchItems();
}

function goToPage(page) {
  store.pagination.page = page;
  fetchItems();
}

async function applyFilters() {
  const filters = {};
  if (searchQuery.value) {
    filters.search = searchQuery.value;
  }
  if (statusFilter.value !== 'all') {
    filters.status = statusFilter.value;
  }
  await store.setFilters(filters);
}

async function clearFilters() {
  searchQuery.value = '';
  statusFilter.value = 'all';
  await store.clearFilters();
}

async function retry() {
  await fetchItems();
}

async function fetchItems() {
  await store.fetchItems({
    sortBy: sortField.value,
    sortOrder: sortOrder.value
  });
}

function getColumnComponent(column) {
  // Return appropriate component based on field type
  const componentMap = {
    'date': 'DateColumn',
    'reference': 'ReferenceColumn',
    'status': 'StatusColumn'
  };
  return componentMap[column.type] || 'DefaultColumn';
}

const debouncedSearch = useDebounce(async () => {
  await applyFilters();
}, 300);

onMounted(async () => {
  await fetchItems();
  store.subscribe();
});

onUnmounted(() => {
  store.unsubscribeFromUpdates();
});
</script>

<style scoped>
.collection-list-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-neutral-dark);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-neutral-dark);
  border-radius: var(--border-radius-md);
  background: white;
  cursor: pointer;
}

.items-table-container {
  overflow-x: auto;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-neutral);
}

.items-table th {
  background: var(--color-background);
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.items-table th:hover {
  background: var(--color-neutral);
}

.sort-indicator {
  margin-left: 0.25rem;
  font-size: 0.75rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 0.7;
}

.btn-icon.danger:hover {
  color: var(--color-danger);
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-neutral);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: var(--color-danger);
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--color-neutral);
}

.page-button {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.warning-text {
  color: var(--color-danger);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>