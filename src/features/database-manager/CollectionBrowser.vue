<template>
  <div class="db-manager">
    <!-- ── Head is handled by useHead() in setup ── -->

    <!-- ── Global error banner ── -->
    <Transition name="slide-down">
      <div v-if="error" class="db-manager__error-banner" role="alert" aria-live="assertive">
        <span class="db-manager__error-icon" aria-hidden="true">⚠</span>
        <span class="db-manager__error-text">{{ error }}</span>
        <button class="db-manager__error-dismiss" @click="clearError" aria-label="Dismiss error">✕</button>
      </div>
    </Transition>

    <!-- ── Page header ── -->
    <header class="db-manager__header">
      <div class="db-manager__header-inner">
        <div class="db-manager__title-group">
          <div class="db-manager__logo" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="14" cy="7" rx="10" ry="4" stroke="currentColor" stroke-width="1.5"/>
              <path d="M4 7v7c0 2.21 4.477 4 10 4s10-1.79 10-4V7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M4 14v7c0 2.21 4.477 4 10 4s10-1.79 10-4v-7" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <div>
            <h1 class="db-manager__title">Database Manager</h1>
            <p class="db-manager__subtitle">Firestore Inspector &amp; Seed Console</p>
          </div>
        </div>
        <div class="db-manager__header-actions">
          <span v-if="currentUser" class="db-manager__user-badge">
            <span class="db-manager__user-dot" aria-hidden="true"></span>
            {{ currentUser.email }}
          </span>
        </div>
      </div>
    </header>

    <!-- ── Main layout ── -->
    <main class="db-manager__main">

      <!-- ── Left panel: collection list ── -->
      <aside class="db-manager__sidebar">
        <div class="db-manager__sidebar-header">
          <h2 class="db-manager__section-title">Collections</h2>
          <button
            class="db-manager__icon-btn"
            :disabled="isLoading"
            aria-label="Refresh collection list"
            @click="handleRefreshCollections"
          >
            <svg :class="['db-manager__icon-spin', { spinning: isLoading }]" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M8 0l2.5 2.5L8 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <ul class="db-manager__collection-list" role="listbox" aria-label="Collections">
          <li
            v-for="col in collections"
            :key="col"
            class="db-manager__collection-item"
            :class="{ 'db-manager__collection-item--active': selectedCollection === col }"
            role="option"
            :aria-selected="selectedCollection === col"
            tabindex="0"
            @click="selectCollection(col)"
            @keydown.enter="selectCollection(col)"
            @keydown.space.prevent="selectCollection(col)"
          >
            <span class="db-manager__collection-icon" aria-hidden="true">⊞</span>
            <span class="db-manager__collection-name">{{ col }}</span>
          </li>
          <li v-if="!collections.length && !isLoading" class="db-manager__collection-empty">
            No collections found
          </li>
          <li v-if="isLoading && !collections.length" class="db-manager__collection-loading" aria-live="polite">
            <span class="db-manager__skeleton" style="width:60%"></span>
            <span class="db-manager__skeleton" style="width:80%"></span>
            <span class="db-manager__skeleton" style="width:50%"></span>
          </li>
        </ul>
      </aside>

      <!-- ── Right panel: tabs + content ── -->
      <section class="db-manager__content" aria-label="Collection workspace">

        <!-- No collection selected -->
        <div v-if="!selectedCollection" class="db-manager__empty-state">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="32" cy="16" rx="22" ry="8" stroke="currentColor" stroke-width="1.5" opacity=".4"/>
            <path d="M10 16v16c0 4.418 9.85 8 22 8s22-3.582 22-8V16" stroke="currentColor" stroke-width="1.5" opacity=".4"/>
            <path d="M10 32v16c0 4.418 9.85 8 22 8s22-3.582 22-8V32" stroke="currentColor" stroke-width="1.5" opacity=".4"/>
          </svg>
          <p>Select a collection to get started</p>
        </div>

        <template v-else>

          <!-- Tab bar -->
          <div class="db-manager__tabs" role="tablist" :aria-label="`Tabs for ${selectedCollection}`">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="db-manager__tab"
              :class="{ 'db-manager__tab--active': activeTab === tab.id }"
              role="tab"
              :aria-selected="activeTab === tab.id"
              :aria-controls="`tabpanel-${tab.id}`"
              :id="`tab-${tab.id}`"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- ── Browse tab ── -->
          <div
            v-show="activeTab === 'browse'"
            id="tabpanel-browse"
            role="tabpanel"
            aria-labelledby="tab-browse"
            class="db-manager__tabpanel"
          >
            <div class="db-manager__toolbar">
              <label class="db-manager__label" for="page-size-select">Page size</label>
              <select
                id="page-size-select"
                v-model.number="browsePage"
                class="db-manager__select"
                @change="handleBrowse"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
              <button class="db-manager__btn db-manager__btn--secondary" :disabled="isLoading" @click="handleBrowse">
                Load Documents
              </button>
            </div>

            <!-- Loading skeleton -->
            <div v-if="isLoading && activeTab === 'browse'" class="db-manager__table-skeleton" aria-live="polite" aria-busy="true">
              <div v-for="n in 5" :key="n" class="db-manager__skeleton-row">
                <span class="db-manager__skeleton" style="width:12%"></span>
                <span class="db-manager__skeleton" style="width:40%"></span>
                <span class="db-manager__skeleton" style="width:20%"></span>
              </div>
            </div>

            <!-- Document table -->
            <div v-else-if="browseDocs.length" class="db-manager__table-wrap">
              <table class="db-manager__table" aria-label="Documents">
                <thead>
                  <tr>
                    <th scope="col" class="db-manager__th">ID</th>
                    <th scope="col" class="db-manager__th">Fields</th>
                    <th scope="col" class="db-manager__th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in browseDocs" :key="row._id" class="db-manager__tr">
                    <td class="db-manager__td db-manager__td--id">
                      <code class="db-manager__code">{{ row._id }}</code>
                    </td>
                    <td class="db-manager__td">
                      <div class="db-manager__field-list">
                        <span
                          v-for="key in visibleKeys(row)"
                          :key="key"
                          class="db-manager__field-chip"
                        >{{ key }}</span>
                      </div>
                    </td>
                    <td class="db-manager__td">
                      <button
                        class="db-manager__btn db-manager__btn--ghost db-manager__btn--sm"
                        @click="openDocInspector(row._id)"
                        :aria-label="`Inspect document ${row._id}`"
                      >Inspect</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-else class="db-manager__hint">Click "Load Documents" to fetch data.</p>

            <!-- Doc inspector drawer -->
            <Transition name="slide-up">
              <div v-if="inspectedDoc" class="db-manager__inspector" role="region" aria-label="Document inspector">
                <div class="db-manager__inspector-header">
                  <h3 class="db-manager__inspector-title">
                    <code>{{ inspectedDoc.id }}</code>
                  </h3>
                  <button class="db-manager__icon-btn" aria-label="Close inspector" @click="inspectedDoc = null">✕</button>
                </div>
                <pre class="db-manager__json">{{ JSON.stringify(inspectedDoc.data, null, 2) }}</pre>
              </div>
            </Transition>
          </div>

          <!-- ── Schema tab ── -->
          <div
            v-show="activeTab === 'schema'"
            id="tabpanel-schema"
            role="tabpanel"
            aria-labelledby="tab-schema"
            class="db-manager__tabpanel"
          >
            <div class="db-manager__toolbar">
              <button class="db-manager__btn db-manager__btn--secondary" :disabled="isLoading" @click="handleViewSchema">
                Infer Schema
              </button>
              <span class="db-manager__hint-inline">Samples up to 50 documents</span>
            </div>

            <div v-if="isLoading && activeTab === 'schema'" class="db-manager__table-skeleton" aria-live="polite" aria-busy="true">
              <div v-for="n in 4" :key="n" class="db-manager__skeleton-row">
                <span class="db-manager__skeleton" style="width:20%"></span>
                <span class="db-manager__skeleton" style="width:30%"></span>
                <span class="db-manager__skeleton" style="width:10%"></span>
              </div>
            </div>

            <div v-else-if="Object.keys(schemaFields).length" class="db-manager__table-wrap">
              <table class="db-manager__table" aria-label="Schema fields">
                <thead>
                  <tr>
                    <th scope="col" class="db-manager__th">Field</th>
                    <th scope="col" class="db-manager__th">Observed Types</th>
                    <th scope="col" class="db-manager__th">Doc Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(meta, field) in schemaFields" :key="field" class="db-manager__tr">
                    <td class="db-manager__td">
                      <code class="db-manager__code">{{ field }}</code>
                    </td>
                    <td class="db-manager__td">
                      <span
                        v-for="t in meta.types"
                        :key="t"
                        :class="['db-manager__type-badge', `db-manager__type-badge--${t}`]"
                      >{{ t }}</span>
                    </td>
                    <td class="db-manager__td db-manager__td--number">
                      {{ meta.count }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-else class="db-manager__hint">Click "Infer Schema" to analyse field types.</p>
          </div>

          <!-- ── Seed tab ── -->
          <div
            v-show="activeTab === 'seed'"
            id="tabpanel-seed"
            role="tabpanel"
            aria-labelledby="tab-seed"
            class="db-manager__tabpanel"
          >
            <form class="db-manager__form" novalidate @submit.prevent="handleSeed">
              <div class="db-manager__form-group">
                <label class="db-manager__label" for="seed-payload">
                  Seed Payload
                  <span class="db-manager__required" aria-hidden="true">*</span>
                  <span class="sr-only">(required)</span>
                </label>
                <textarea
                  id="seed-payload"
                  v-model="seedPayloadRaw"
                  class="db-manager__textarea"
                  :class="{ 'db-manager__textarea--error': seedErrors.payload }"
                  rows="10"
                  placeholder='[{ "name": "Alice", "role": "admin" }]'
                  spellcheck="false"
                  autocomplete="off"
                  aria-describedby="seed-payload-error seed-payload-hint"
                  @blur="validateSeedPayload"
                ></textarea>
                <p id="seed-payload-hint" class="db-manager__field-hint">
                  JSON array of document objects. Optional <code>id</code> field sets the document ID.
                </p>
                <p
                  v-if="seedErrors.payload"
                  id="seed-payload-error"
                  class="db-manager__field-error"
                  role="alert"
                >{{ seedErrors.payload }}</p>
              </div>

              <div class="db-manager__form-row">
                <div class="db-manager__form-group db-manager__form-group--half">
                  <label class="db-manager__label" for="seed-merge">
                    Write mode
                  </label>
                  <select id="seed-merge" v-model="seedMerge" class="db-manager__select">
                    <option :value="false">Overwrite (set)</option>
                    <option :value="true">Merge (set merge)</option>
                  </select>
                </div>
              </div>

              <div class="db-manager__form-actions">
                <button
                  type="submit"
                  class="db-manager__btn db-manager__btn--primary"
                  :disabled="isLoading || !!seedErrors.payload"
                >
                  <span v-if="isLoading" class="db-manager__btn-spinner" aria-hidden="true"></span>
                  {{ isLoading ? 'Seeding…' : 'Seed Collection' }}
                </button>
                <button type="button" class="db-manager__btn db-manager__btn--ghost" @click="resetSeedForm">
                  Reset
                </button>
              </div>

              <Transition name="fade">
                <div v-if="seedResult" class="db-manager__success-banner" role="status" aria-live="polite">
                  ✓ Seeded {{ seedResult.seeded }} document(s) into <strong>{{ seedResult.collection }}</strong>.
                </div>
              </Transition>
            </form>
          </div>

          <!-- ── Backup tab ── -->
          <div
            v-show="activeTab === 'backup'"
            id="tabpanel-backup"
            role="tabpanel"
            aria-labelledby="tab-backup"
            class="db-manager__tabpanel"
          >
            <form class="db-manager__form" novalidate @submit.prevent="handleBackup">
              <div class="db-manager__form-group">
                <label class="db-manager__label" for="backup-dest">
                  Destination collection name
                  <span class="db-manager__hint-inline">(leave blank for auto-generated name)</span>
                </label>
                <input
                  id="backup-dest"
                  v-model="backupDest"
                  class="db-manager__input"
                  :class="{ 'db-manager__input--error': backupErrors.dest }"
                  type="text"
                  placeholder="my_backup_collection"
                  autocomplete="off"
                  spellcheck="false"
                  aria-describedby="backup-dest-error"
                  @blur="validateBackupDest"
                />
                <p
                  v-if="backupErrors.dest"
                  id="backup-dest-error"
                  class="db-manager__field-error"
                  role="alert"
                >{{ backupErrors.dest }}</p>
              </div>

              <div class="db-manager__form-actions">
                <button
                  type="submit"
                  class="db-manager__btn db-manager__btn--primary"
                  :disabled="isLoading || !!backupErrors.dest"
                >
                  <span v-if="isLoading" class="db-manager__btn-spinner" aria-hidden="true"></span>
                  {{ isLoading ? 'Backing up…' : 'Backup Collection' }}
                </button>
              </div>

              <Transition name="fade">
                <div v-if="backupResult" class="db-manager__success-banner" role="status" aria-live="polite">
                  ✓ Backed up {{ backupResult.docCount }} document(s) → <strong>{{ backupResult.destination }}</strong>.
                </div>
              </Transition>
            </form>
          </div>

        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useHead } from '@vueuse/head';
import { useDatabaseManager } from '../hooks/use-database-manager.js';

// ─── SEO ──────────────────────────────────────────────────────────────────────
useHead({
  title: 'Database Manager | Admin Console',
  meta: [
    { name: 'description', content: 'Firestore collection inspector, seed data, and schema viewer.' },
    { name: 'robots', content: 'noindex, nofollow' } // admin page – never indexed
  ]
});

// ─── Composable ───────────────────────────────────────────────────────────────
const {
  loading,
  error,
  collections,
  schemaFields,
  currentUser,
  isLoading,
  listCollections,
  browseCollection,
  viewSchema,
  seedCollection,
  inspectDoc,
  backupCollection
} = useDatabaseManager();

// ─── State ────────────────────────────────────────────────────────────────────
const selectedCollection = ref(null);
const activeTab = ref('browse');
const browsePage = ref(25);
const browseDocs = ref([]);
const inspectedDoc = ref(null);

// Seed form
const seedPayloadRaw = ref('');
const seedMerge = ref(false);
const seedErrors = ref({ payload: '' });
const seedResult = ref(null);

// Backup form
const backupDest = ref('');
const backupErrors = ref({ dest: '' });
const backupResult = ref(null);

const tabs = [
  { id: 'browse', label: 'Browse' },
  { id: 'schema', label: 'Schema' },
  { id: 'seed',   label: 'Seed' },
  { id: 'backup', label: 'Backup' }
];

// ─── Computed ─────────────────────────────────────────────────────────────────
// Sanitise key display (XSS: rendered only as text via Vue's default escaping)
function visibleKeys(row) {
  return Object.keys(row).filter((k) => k !== '_id').slice(0, 6);
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  listCollections();
});

watch(selectedCollection, () => {
  browseDocs.value = [];
  inspectedDoc.value = null;
  seedResult.value = null;
  backupResult.value = null;
  activeTab.value = 'browse';
});

// ─── Handlers ────────────────────────────────────────────────────────────────

function clearError() {
  error.value = null;
}

async function handleRefreshCollections() {
  await listCollections();
}

function selectCollection(col) {
  selectedCollection.value = col;
}

async function handleBrowse() {
  if (!selectedCollection.value) return;
  browseDocs.value = await browseCollection(selectedCollection.value, browsePage.value);
}

async function openDocInspector(docId) {
  if (!selectedCollection.value || !docId) return;
  const result = await inspectDoc(`${selectedCollection.value}/${docId}`);
  inspectedDoc.value = result;
}

async function handleViewSchema() {
  if (!selectedCollection.value) return;
  await viewSchema(selectedCollection.value);
}

// ── Seed validation ──
function validateSeedPayload() {
  const raw = seedPayloadRaw.value.trim();
  if (!raw) {
    seedErrors.value.payload = 'Payload is required.';
    return false;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      seedErrors.value.payload = 'Payload must be a JSON array.';
      return false;
    }
    if (parsed.length === 0) {
      seedErrors.value.payload = 'Array must contain at least one document.';
      return false;
    }
    // XSS: values are sent to Firestore, never rendered as HTML
    seedErrors.value.payload = '';
    return true;
  } catch (_) {
    seedErrors.value.payload = 'Invalid JSON. Please check syntax.';
    return false;
  }
}

async function handleSeed() {
  seedResult.value = null;
  if (!validateSeedPayload()) return;
  const payload = JSON.parse(seedPayloadRaw.value);
  const result = await seedCollection(selectedCollection.value, payload, { merge: seedMerge.value });
  if (result) seedResult.value = result;
}

function resetSeedForm() {
  seedPayloadRaw.value = '';
  seedMerge.value = false;
  seedErrors.value.payload = '';
  seedResult.value = null;
}

// ── Backup validation ──
function validateBackupDest() {
  const val = backupDest.value.trim();
  if (val && !/^[a-zA-Z0-9_-]+$/.test(val)) {
    backupErrors.value.dest = 'Only alphanumeric characters, hyphens, and underscores allowed.';
    return false;
  }
  backupErrors.value.dest = '';
  return true;
}

async function handleBackup() {
  backupResult.value = null;
  if (!validateBackupDest()) return;
  const result = await backupCollection(
    selectedCollection.value,
    backupDest.value.trim() || undefined
  );
  if (result) backupResult.value = result;
}
</script>

<style scoped>
/* ─── Design tokens ─────────────────────────────────────────────────────── */
.db-manager {
  --c-bg:          #0e1117;
  --c-surface:     #161b25;
  --c-surface-2:   #1e2636;
  --c-border:      #2a3348;
  --c-text:        #dce6f7;
  --c-text-muted:  #6a7fa8;
  --c-accent:      #3b7fff;
  --c-accent-dim:  #1e3a6e;
  --c-success:     #22c55e;
  --c-error:       #f87171;
  --c-warning:     #fbbf24;
  --c-code-bg:     #0d1320;

  --r-sm:  4px;
  --r-md:  8px;
  --r-lg:  12px;

  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-ui:   'DM Sans', 'Inter', system-ui, sans-serif;

  font-family: var(--font-ui);
  background: var(--c-bg);
  color: var(--c-text);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ─── Screen-reader only ──────────────────────────────────────────────── */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* ─── Error banner ───────────────────────────────────────────────────── */
.db-manager__error-banner {
  display: flex; align-items: center; gap: 10px;
  background: color-mix(in srgb, var(--c-error) 12%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--c-error) 30%, transparent);
  padding: 10px 24px;
  font-size: 0.875rem;
}
.db-manager__error-icon { color: var(--c-error); font-size: 1rem; }
.db-manager__error-text { flex: 1; color: var(--c-error); }
.db-manager__error-dismiss {
  background: none; border: none; cursor: pointer;
  color: var(--c-text-muted); font-size: 1rem; padding: 0 4px;
  transition: color 0.15s;
}
.db-manager__error-dismiss:hover { color: var(--c-text); }

/* ─── Header ─────────────────────────────────────────────────────────── */
.db-manager__header {
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface);
}
.db-manager__header-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px;
}
.db-manager__title-group { display: flex; align-items: center; gap: 14px; }
.db-manager__logo { color: var(--c-accent); opacity: 0.85; }
.db-manager__title {
  font-size: 1.1rem; font-weight: 600; letter-spacing: -0.02em;
  margin: 0; line-height: 1.2;
}
.db-manager__subtitle { font-size: 0.75rem; color: var(--c-text-muted); margin: 2px 0 0; }

.db-manager__user-badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.8rem; color: var(--c-text-muted);
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  padding: 4px 10px; border-radius: 100px;
}
.db-manager__user-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--c-success);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--c-success) 25%, transparent);
}

/* ─── Main layout ────────────────────────────────────────────────────── */
.db-manager__main {
  flex: 1; display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 0;
}

/* ─── Sidebar ────────────────────────────────────────────────────────── */
.db-manager__sidebar {
  border-right: 1px solid var(--c-border);
  background: var(--c-surface);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.db-manager__sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 10px;
}
.db-manager__section-title {
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--c-text-muted); margin: 0;
}
.db-manager__icon-btn {
  background: none; border: none; cursor: pointer;
  color: var(--c-text-muted); padding: 4px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  transition: color 0.15s, background 0.15s;
}
.db-manager__icon-btn:hover:not(:disabled) {
  color: var(--c-text); background: var(--c-surface-2);
}
.db-manager__icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.db-manager__icon-spin { transition: transform 0.3s; }
.db-manager__icon-spin.spinning { animation: spin 1s linear infinite; }

.db-manager__collection-list {
  list-style: none; padding: 0 8px 16px; margin: 0;
  overflow-y: auto; flex: 1;
  scrollbar-width: thin; scrollbar-color: var(--c-border) transparent;
}
.db-manager__collection-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: var(--r-md); cursor: pointer;
  font-size: 0.85rem; color: var(--c-text-muted);
  transition: background 0.12s, color 0.12s;
  user-select: none;
}
.db-manager__collection-item:hover,
.db-manager__collection-item:focus-visible {
  background: var(--c-surface-2); color: var(--c-text);
  outline: none;
}
.db-manager__collection-item--active {
  background: var(--c-accent-dim); color: var(--c-text);
  font-weight: 500;
}
.db-manager__collection-icon { opacity: 0.5; font-size: 0.75rem; }
.db-manager__collection-name {
  font-family: var(--font-mono); font-size: 0.8rem; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}
.db-manager__collection-empty,
.db-manager__collection-loading {
  padding: 12px 10px;
  font-size: 0.8rem; color: var(--c-text-muted);
  display: flex; flex-direction: column; gap: 6px;
}

/* ─── Content area ───────────────────────────────────────────────────── */
.db-manager__content {
  display: flex; flex-direction: column;
  overflow: hidden;
  background: var(--c-bg);
}
.db-manager__empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  color: var(--c-text-muted); opacity: 0.4;
  font-size: 0.9rem;
}

/* ─── Tabs ───────────────────────────────────────────────────────────── */
.db-manager__tabs {
  display: flex; gap: 2px;
  border-bottom: 1px solid var(--c-border);
  padding: 0 20px;
  background: var(--c-surface);
}
.db-manager__tab {
  background: none; border: none; cursor: pointer;
  color: var(--c-text-muted); font-family: var(--font-ui);
  font-size: 0.85rem; padding: 11px 14px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}
.db-manager__tab:hover { color: var(--c-text); }
.db-manager__tab--active {
  color: var(--c-text); border-bottom-color: var(--c-accent);
  font-weight: 500;
}
.db-manager__tabpanel {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
  scrollbar-width: thin; scrollbar-color: var(--c-border) transparent;
}

/* ─── Toolbar ────────────────────────────────────────────────────────── */
.db-manager__toolbar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.db-manager__hint {
  font-size: 0.82rem; color: var(--c-text-muted); margin: 0;
}
.db-manager__hint-inline {
  font-size: 0.78rem; color: var(--c-text-muted);
}

/* ─── Table ──────────────────────────────────────────────────────────── */
.db-manager__table-wrap {
  border: 1px solid var(--c-border); border-radius: var(--r-lg);
  overflow: hidden; overflow-x: auto;
}
.db-manager__table {
  width: 100%; border-collapse: collapse;
  font-size: 0.84rem;
}
.db-manager__th {
  padding: 10px 14px; text-align: left;
  font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--c-text-muted);
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
}
.db-manager__tr { border-bottom: 1px solid var(--c-border); }
.db-manager__tr:last-child { border-bottom: none; }
.db-manager__tr:hover { background: var(--c-surface); }
.db-manager__td {
  padding: 10px 14px; vertical-align: top;
  color: var(--c-text);
}
.db-manager__td--id { width: 220px; }
.db-manager__td--number { text-align: right; font-variant-numeric: tabular-nums; }

.db-manager__code {
  font-family: var(--font-mono); font-size: 0.78rem;
  color: var(--c-accent); background: var(--c-accent-dim);
  padding: 2px 6px; border-radius: var(--r-sm);
  display: inline-block; max-width: 200px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.db-manager__field-list { display: flex; flex-wrap: wrap; gap: 4px; }
.db-manager__field-chip {
  font-family: var(--font-mono); font-size: 0.72rem;
  padding: 2px 6px; border-radius: var(--r-sm);
  background: var(--c-surface-2); color: var(--c-text-muted);
  border: 1px solid var(--c-border);
}

.db-manager__type-badge {
  font-family: var(--font-mono); font-size: 0.72rem;
  padding: 2px 7px; border-radius: 100px;
  margin-right: 4px; display: inline-block;
  border: 1px solid transparent;
}
.db-manager__type-badge--string  { background: #1a3a2a; color: var(--c-success); border-color: #224d36; }
.db-manager__type-badge--number  { background: #1a2e4a; color: #60a5fa; border-color: #1e3d63; }
.db-manager__type-badge--boolean { background: #2d2010; color: var(--c-warning); border-color: #3d2e12; }
.db-manager__type-badge--object  { background: #261a38; color: #c084fc; border-color: #342250; }
.db-manager__type-badge--array   { background: #1e1e10; color: #facc15; border-color: #2d2d14; }
.db-manager__type-badge--null    { background: var(--c-surface-2); color: var(--c-text-muted); }

/* ─── Inspector ──────────────────────────────────────────────────────── */
.db-manager__inspector {
  border: 1px solid var(--c-border); border-radius: var(--r-lg);
  background: var(--c-code-bg); overflow: hidden;
}
.db-manager__inspector-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--c-border);
}
.db-manager__inspector-title { font-size: 0.85rem; margin: 0; }
.db-manager__json {
  font-family: var(--font-mono); font-size: 0.78rem;
  padding: 14px; overflow-x: auto; margin: 0;
  color: var(--c-text); line-height: 1.6;
  white-space: pre; word-break: normal;
}

/* ─── Form ───────────────────────────────────────────────────────────── */
.db-manager__form { display: flex; flex-direction: column; gap: 16px; max-width: 680px; }
.db-manager__form-group { display: flex; flex-direction: column; gap: 6px; }
.db-manager__form-group--half { flex: 1; }
.db-manager__form-row { display: flex; gap: 14px; flex-wrap: wrap; }
.db-manager__form-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

.db-manager__label {
  font-size: 0.8rem; font-weight: 500; color: var(--c-text);
  display: flex; align-items: center; gap: 6px;
}
.db-manager__required { color: var(--c-error); }
.db-manager__field-hint { font-size: 0.75rem; color: var(--c-text-muted); margin: 0; }
.db-manager__field-error { font-size: 0.78rem; color: var(--c-error); margin: 0; }

.db-manager__input,
.db-manager__select,
.db-manager__textarea {
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  color: var(--c-text);
  font-family: var(--font-ui); font-size: 0.875rem;
  padding: 9px 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  width: 100%; box-sizing: border-box;
}
.db-manager__textarea {
  font-family: var(--font-mono); font-size: 0.78rem;
  resize: vertical; min-height: 200px;
  line-height: 1.55;
}
.db-manager__input:focus,
.db-manager__select:focus,
.db-manager__textarea:focus {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent) 18%, transparent);
}
.db-manager__input--error,
.db-manager__textarea--error {
  border-color: var(--c-error);
}
.db-manager__input--error:focus,
.db-manager__textarea--error:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-error) 18%, transparent);
}
.db-manager__select { cursor: pointer; }

/* ─── Buttons ────────────────────────────────────────────────────────── */
.db-manager__btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-ui); font-size: 0.85rem; font-weight: 500;
  padding: 9px 18px; border-radius: var(--r-md);
  border: none; cursor: pointer;
  transition: background 0.15s, opacity 0.15s, transform 0.1s;
  white-space: nowrap;
}
.db-manager__btn:active:not(:disabled) { transform: scale(0.98); }
.db-manager__btn:disabled { opacity: 0.45; cursor: not-allowed; }
.db-manager__btn--primary { background: var(--c-accent); color: #fff; }
.db-manager__btn--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--c-accent) 85%, white);
}
.db-manager__btn--secondary {
  background: var(--c-surface-2); color: var(--c-text);
  border: 1px solid var(--c-border);
}
.db-manager__btn--secondary:hover:not(:disabled) { background: var(--c-border); }
.db-manager__btn--ghost {
  background: transparent; color: var(--c-text-muted);
  border: 1px solid transparent;
}
.db-manager__btn--ghost:hover:not(:disabled) {
  background: var(--c-surface-2); color: var(--c-text);
}
.db-manager__btn--sm { padding: 5px 12px; font-size: 0.78rem; }

.db-manager__btn-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  animation: spin 0.75s linear infinite;
  display: inline-block;
}

/* ─── Banners ────────────────────────────────────────────────────────── */
.db-manager__success-banner {
  display: flex; align-items: center; gap: 8px;
  background: color-mix(in srgb, var(--c-success) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-success) 25%, transparent);
  color: var(--c-success);
  padding: 10px 14px; border-radius: var(--r-md);
  font-size: 0.85rem;
}

/* ─── Skeletons ──────────────────────────────────────────────────────── */
.db-manager__skeleton {
  display: block; height: 14px; border-radius: var(--r-sm);
  background: linear-gradient(90deg, var(--c-surface-2) 25%, var(--c-border) 50%, var(--c-surface-2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.db-manager__skeleton-row {
  display: flex; gap: 16px; padding: 10px 0;
  border-bottom: 1px solid var(--c-border);
}
.db-manager__table-skeleton { padding: 0 4px; }

/* ─── Animations ─────────────────────────────────────────────────────── */
@keyframes spin    { to { transform: rotate(360deg); } }
@keyframes shimmer { to { background-position: -200% 0; } }

/* Vue transitions */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-6px); }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.22s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(10px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ─── Responsive ─────────────────────────────────────────────────────── */
@media (max-width: 720px) {
  .db-manager__main { grid-template-columns: 1fr; }
  .db-manager__sidebar {
    border-right: none;
    border-bottom: 1px solid var(--c-border);
    max-height: 220px;
  }
}
</style>
