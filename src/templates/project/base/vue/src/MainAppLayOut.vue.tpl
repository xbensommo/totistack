<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@app/stores/appStore'

import { links } from '@generated/routes.js'
import AOS from 'aos'

const store = useAppStore()
const route = useRoute()

const isSidebarOpen = ref(true)
const isMobileMenuOpen = ref(false)
const notificationPolling = ref(null)

// --- Notification Count with Reactivity ---
const unreadNotificationsCount = computed(() => {
  return 0// store.notifications?.aggregatedCount || 0
})

const formattedNotificationCount = computed(() => {
  const count = unreadNotificationsCount.value
  if (count === 0) return null
  return count > 99 ? '99+' : count.toString()
})

// --- UI Helpers ---
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

function titleCase(value = '') {
  return String(value)
  .replace(/[-_]/g, ' ')
  .replace(/\b\w/g, (char) => char.toUpperCase())
  .trim()
}

function inferGroup(routeRecord) {
  if (routeRecord?.meta?.navGroup) return routeRecord.meta.navGroup
  if (routeRecord?.meta?.group) return routeRecord.meta.group
  if (routeRecord?.meta?.feature) return titleCase(routeRecord.meta.feature)
  return 'Modules'
}

/**
 * Infers the appropriate FontAwesome 6 icon based on route metadata.
 * * @param {import('vue-router').RouteRecordRaw} routeRecord
 * @returns {string} FontAwesome class string
 */
function inferIcon(routeRecord) {
  const haystack = [
    routeRecord?.name,
    routeRecord?.path,
    routeRecord?.meta?.title,
    routeRecord?.meta?.feature,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  // Finance & Money
  if (haystack.includes('finance') || haystack.includes('transaction') || haystack.includes('payment')) {
    return 'fas fa-money-bill-transfer'
  }
  if (haystack.includes('payout') || haystack.includes('refund')) {
    return 'fas fa-hand-holding-dollar'
  }
  if (haystack.includes('expense')) return 'fas fa-receipt'
  if (haystack.includes('account')) return 'fas fa-building-columns'

  // CRM & Client Records
  if (haystack.includes('client') || haystack.includes('customer')) return 'fas fa-address-book'
  if (haystack.includes('crm') || haystack.includes('engagement') || haystack.includes('work')) {
    return 'fas fa-briefcase'
  }
  if (haystack.includes('activity')) return 'fas fa-clock-rotate-left'
  if (haystack.includes('communication')) return 'fas fa-comments'

  // Dashboard & Analytics
  if (haystack.includes('dashboard')) return 'fas fa-chart-line'
  if (haystack.includes('report') || haystack.includes('analytics') || haystack.includes('statement')) {
    return 'fas fa-chart-pie'
  }

  // System & Media
  if (haystack.includes('media') || haystack.includes('file')) return 'fas fa-folder-open'
  if (haystack.includes('upload')) return 'fas fa-cloud-arrow-up'
  if (haystack.includes('user') || haystack.includes('team') || haystack.includes('profile')) {
    return 'fas fa-user-gear'
  }
  if (haystack.includes('setting') || haystack.includes('preference')) return 'fas fa-sliders'

  // Notifications
  if (haystack.includes('notification') || haystack.includes('alert')) return 'fas fa-bell'

  // Default fallback for Totisoft Modules
  return 'fas fa-cubes'
}

function isNotificationsRoute(routeRecord) {
  const haystack = [
  routeRecord?.name,
  routeRecord?.path,
  routeRecord?.meta?.title,
  routeRecord?.meta?.feature,
  ]
  .filter(Boolean)
  .join(' ')
  .toLowerCase()
  
  return haystack.includes('notification') || haystack.includes('alert')
}

/**
 * Determine whether a route should appear in navigation.
 * A route must be nav-visible and access-allowed.
 *
 * @param {import('vue-router').RouteRecordRaw} routeRecord
 * @returns {boolean}
 */
function shouldShowInNavigation(routeRecord) {
  if (!routeRecord || typeof routeRecord.path !== 'string') return false
  if (routeRecord.meta?.hideInNav === true) return false
  if (routeRecord.path.includes('/:')) return false
  if (routeRecord.meta?.publicAccess === true) return false
  if (routeRecord.meta?.navigation === false) return false

  if (typeof store.canAccessRoute === 'function') {
    return store.canAccessRoute(routeRecord.meta || {})
  }
  return true
}

function normalizeNavigationLink(routeRecord) {
  if (!shouldShowInNavigation(routeRecord)) return null
  
  return {
    group: inferGroup(routeRecord),
    name:
    routeRecord.meta?.navLabel ||
    routeRecord.meta?.title ||
    routeRecord.name ||
    routeRecord.path,
    href: routeRecord.path,
    icon: routeRecord.meta?.icon || inferIcon(routeRecord),
    badge: isNotificationsRoute(routeRecord) ? formattedNotificationCount.value : null,
  }
}

const generatedNavigation = computed(() => {
  const grouped = new Map()
  
  for (const routeRecord of Array.isArray(links) ? links : []) {
    const navItem = normalizeNavigationLink(routeRecord)
    if (!navItem) continue
    
    if (!grouped.has(navItem.group)) {
      grouped.set(navItem.group, [])
    }
    
    grouped.get(navItem.group).push(navItem)
  }
  return Array.from(grouped.entries()).map(([group, groupLinks]) => ({
    group,
    links: groupLinks,
  }))
})

const navigation = computed(() => [
...generatedNavigation.value,
{
  group: 'System',
  links: [{ name: 'Log Out', href: '/logout', icon: 'fas fa-sign-out-alt' }],
},
])

const notificationsHref = computed(() => {
  const allLinks = generatedNavigation.value.flatMap((group) => group.links)
  const match = allLinks.find((link) => {
    const haystack = `${link.name} ${link.href}`.toLowerCase()
    return haystack.includes('notification') || haystack.includes('alert')
  })
  
  return match?.href || '/notifications'
})

function isActiveLink(href) {
  if (!href) return false
  if (route.path === href) return true
  if (href !== '/' && route.path.startsWith(`${href}/`)) return true
  return false
}

// --- Fetch Notification Count ---
const fetchNotificationCount = async () => {
  try {
    if (!store.currentUser?.uid) {
      console.warn('No user logged in')
      return
    }
    
    await store.notificationsActions.fetchInitialPage({ read: false,

    })
  } catch (error) {
    console.error('Failed to fetch notification count:', error)
  }
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  AOS.init({ duration: 600, once: true })
  
  await fetchNotificationCount()
  
  notificationPolling.value = setInterval(fetchNotificationCount, 50000)
})

onUnmounted(() => {
  if (notificationPolling.value) {
    clearInterval(notificationPolling.value)
  }
})
</script>
<template>
  <div class="flex h-dvh bg-[var(--color-background)] text-[var(--color-text)] overflow-hidden">
    <aside
      :class="[
        isSidebarOpen ? 'w-[var(--sidebar-width)]' : 'w-24',
        'hidden lg:flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-xl transition-[width] duration-300 ease-out sticky top-0',
      ]"
    >
      <div class="border-b border-[var(--color-border)] p-4">
        <div class="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--gradient-brand)] px-3 py-3 text-[var(--color-text-inverse)] shadow-lg">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-white/15 ring-1 ring-white/20">
            <i class="fa-solid fa-user-shield text-base"></i>
          </div>

          <div v-if="isSidebarOpen" class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70">Portal</p>
            <h1 class="truncate text-lg font-bold leading-tight">Totisoft</h1>
          </div>
        </div>
      </div>

      <nav class="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 py-4">
        <section v-for="group in navigation" :key="group.group" class="mb-6">
          <p v-if="isSidebarOpen" class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            {{ group.group }}
          </p>

          <div class="space-y-1.5">
            <router-link
              v-for="link in group.links"
              :key="`${group.group}-${link.href}`"
              :to="link.href"
              class="group relative flex min-h-[3.25rem] items-center gap-3 rounded-[var(--radius-sm)] border border-transparent px-3 text-sm font-medium transition-all duration-200"
              :class="[
                isSidebarOpen ? 'justify-start' : 'justify-center',
                isActiveLink(link.href)
                  ? 'bg-[var(--color-surface-3)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]',
              ]"
            >
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-all"
                :class="
                  isActiveLink(link.href)
                    ? 'border-transparent bg-[var(--color-surface)] text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]'
                "
              >
                <i :class="link.icon"></i>
              </span>

              <span v-if="isSidebarOpen" class="min-w-0 flex-1 truncate">{{ link.name }}</span>

              <span
                v-if="isSidebarOpen && link.badge"
                class="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-[var(--color-primary)] px-2 py-1 text-[10px] font-bold text-[var(--color-text-inverse)] shadow"
              >
                {{ link.badge }}
              </span>
            </router-link>
          </div>
        </section>
      </nav>

      <div class="shrink-0 border-t border-[var(--color-border)] p-3">
        <div class="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3" :class="isSidebarOpen ? '' : 'flex justify-center'">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[rgba(22,199,132,0.1)] text-[var(--color-success)]">
              <i class="fa-solid fa-server"></i>
            </span>
            <div v-if="isSidebarOpen" class="min-w-0">
              <p class="truncate text-sm font-semibold text-[var(--color-text)]">
                {{
                  store.currentUser.firstName
                }}
              </p>
              <p class="truncate text-xs text-[var(--color-text-muted)]">{{ store.currentUser?.role}}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Drawer -->
    <transition name="drawer">
      <div v-if="isMobileMenuOpen" class="lg:hidden fixed inset-0 z-[100] flex">
        <div
          class="absolute inset-0 bg-black/10 backdrop-blur-sm"
          @click="closeMobileMenu"
        ></div>
        <div
          class="relative w-80 h-full bg-accent/80 border-r border-white/10 p-6 flex flex-col shadow-2xl"
        >
          <div class="flex justify-between items-center mb-10">
            <span class="font-space font-bold text-xl text-white"
              >Totisoft<span class="text-[var(--color-primary)]"> CRM</span></span
            >
            <button @click="closeMobileMenu" class="text-white/50">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <nav class="flex-1 overflow-y-auto space-y-6">
            <div v-for="group in navigation" :key="group.group">
              <p
                class="text-[10px] font-bold text-[var(--color-neutral)] uppercase tracking-widest mb-3 px-2"
              >
                {{ group.group }}
              </p>
              <div class="space-y-1">
                <router-link
                  v-for="link in group.links"
                  :key="link.name"
                  :to="link.href"
                  @click="closeMobileMenu"
                  class="flex items-center gap-4 px-4 py-4 rounded-xl transition-all relative"
                  :class="{
                    'bg-[var(--color-primary)]/20 text-[var(--color-primary)]':
                      route.path === link.href,
                    'text-[var(--color-neutral)] hover:bg-white/5':
                      route.path !== link.href,
                  }"
                >
                  <i :class="link.icon"></i>
                  <span class="font-medium flex-1">{{ link.name }}</span>
                  
                  <!-- Notification Badge (mobile) -->
                  <span
                    v-if="link.badge"
                    class="px-2 py-0.5 text-[10px] font-bold bg-[var(--color-primary)] text-white rounded-full min-w-[20px] text-center"
                  >
                    {{ link.badge }}
                  </span>
                </router-link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </transition>

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-background)]">
      <header class="sticky top-0 z-30 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 px-6 py-3 backdrop-blur-xl">
        
        <div class="flex min-w-0 items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <button @click="toggleSidebar" class="hidden h-11 w-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] lg:inline-flex" type="button">
              <i class="fa-solid" :class="isSidebarOpen ? 'fa-indent' : 'fa-outdent'"></i>
            </button>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">{{ route.meta?.feature || 'Admin' }}</p>
              <h2 class="text-lg font-bold text-[var(--color-text)]">{{ route.meta?.title || route.name }}</h2>
            </div>
          </div>

          <button
            @click="isMobileMenuOpen = true"
            class="lg:hidden w-10 h-10 flex items-center justify-center text-primary"
          >
            <i class="fas fa-bars-staggered text-xl"></i>
          </button>
        </div>
      </header>

      <main class="min-w-0 flex-1 overflow-y-auto custom-scrollbar p-6">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>