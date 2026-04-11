import { ref } from 'vue';
import { generatedCollectionNames } from '@generated/collections.js';

/**
 * Create the default state bucket for a sharded collection.
 *
 * @param {string} collectionName
 * @returns {import('vue').Ref<Record<string, any>>}
 */
function createCollectionState(collectionName) {
  return ref({
    name: collectionName,
    items: [],
    itemById: null,
    lastVisible: null,
    hasMore: true,
    filters: {},
    activeFilters: {},
    aggregatedCount: null,
    orderBy: {
      field: 'createdAt',
      direction: 'desc',
    },
    pageSize: 15,
    shardDate: new Date(),
    search: {
      term: '',
      field: 'name',
      results: [],
      isActive: false,
    },
    total: 0,
  });
}

/**
 * Create the default application store state.
 *
 * Auth and RBAC live here because they are platform concerns shared by the
 * whole project rather than owned by individual features.
 *
 * @returns {Record<string, any>}
 */
export default function useAppStoreState() {
  const state = {
    currentUser: ref(null),
    authInitialized: ref(false),
    claims: ref({}),
    roles: ref([]),
    permissions: ref([]),
    loading: ref(false),
    isLoading: ref(false),
    error: ref(null),
    recentActivity: ref([]),
    currentLocation: ref(null),
    accessRuntimeEnabled: ref(false),
    rbacEnabled: ref(false),
    authStatus: ref('idle'),
    _authUnsubscribe: ref(null),
    _profileCache: ref({ uid: null, timestamp: 0, data: null }),
    _userCache: ref(new Map()),
    _permissionCache: ref(new Map()),
    _tokenRefreshTimer: ref(null),
    _cacheCleanupTimer: ref(null),
    _sessionStart: ref(0),
  };

  generatedCollectionNames.forEach((collectionName) => {
    state[collectionName] = createCollectionState(collectionName);
  });

  return state;
}
