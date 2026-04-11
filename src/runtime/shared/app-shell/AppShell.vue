/**
 * @file AppShell.vue
 * @description Main application shell component with navigation, header, and footer.
 * @date 2026-03-22
 * @author Totistack Team
 */

<template>
  <div class="app-shell" :class="[layout, theme]">
    <header v-if="showHeader" class="app-header">
      <div class="header-container">
        <div class="logo" @click="navigateToHome">
          <img v-if="logo" :src="logo" :alt="appName" />
          <span v-else>{{ appName }}</span>
        </div>
        
        <nav class="main-nav">
          <ul>
            <li v-for="item in navigationItems" :key="item.path">
              <router-link 
                :to="item.path" 
                :class="{ active: isActiveRoute(item.path) }"
                @click="closeMobileMenu"
              >
                <i v-if="item.icon" :class="item.icon"></i>
                <span>{{ item.label }}</span>
              </router-link>
            </li>
          </ul>
        </nav>
        
        <div class="user-menu" v-if="user">
          <button @click="toggleUserMenu" class="user-button">
            <img v-if="user.photoURL" :src="user.photoURL" class="avatar" />
            <div v-else class="avatar-placeholder">
              {{ userInitials }}
            </div>
          </button>
          
          <div v-if="showUserMenu" class="dropdown-menu">
            <router-link to="/profile">Profile</router-link>
            <router-link to="/settings">Settings</router-link>
            <button @click="logout">Logout</button>
          </div>
        </div>
        
        <button 
          class="mobile-menu-button" 
          @click="toggleMobileMenu"
          :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
    
    <aside v-if="showSidebar" class="app-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <button class="collapse-button" @click="toggleSidebar">
        <i :class="sidebarCollapsed ? 'chevron-right' : 'chevron-left'"></i>
      </button>
      
      <nav class="sidebar-nav">
        <ul>
          <li v-for="item in sidebarItems" :key="item.path">
            <router-link :to="item.path" :title="sidebarCollapsed ? item.label : undefined">
              <i :class="item.icon"></i>
              <span v-if="!sidebarCollapsed">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>
    
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <footer v-if="showFooter" class="app-footer">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} {{ appName }}. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store.js';

export default {
  name: 'AppShell',
  props: {
    layout: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'compact', 'full-width'].includes(value)
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showSidebar: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    
    const mobileMenuOpen = ref(false);
    const showUserMenu = ref(false);
    const sidebarCollapsed = ref(false);
    
    // Computed properties
    const appName = computed(() => {
      return window.__TOTISTACK_CONFIG__?.branding?.appName || 'Totistack App';
    });
    
    const logo = computed(() => {
      return window.__TOTISTACK_CONFIG__?.branding?.logo || null;
    });
    
    const user = computed(() => authStore.user);
    
    const userInitials = computed(() => {
      if (!user.value) return '';
      return user.value.displayName
        ? user.value.displayName.charAt(0).toUpperCase()
        : user.value.email.charAt(0).toUpperCase();
    });
    
    const navigationItems = computed(() => {
      // Load from config or module registry
      return window.__TOTISTACK_NAVIGATION__ || [];
    });
    
    const sidebarItems = computed(() => {
      // Load from config
      return window.__TOTISTACK_SIDEBAR__ || [];
    });
    
    const currentYear = computed(() => new Date().getFullYear());
    
    // Methods
    const navigateToHome = () => {
      router.push('/');
    };
    
    const isActiveRoute = (path) => {
      return route.path === path || route.path.startsWith(path + '/');
    };
    
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
      if (mobileMenuOpen.value) {
        document.body.classList.add('mobile-menu-open');
      } else {
        document.body.classList.remove('mobile-menu-open');
      }
    };
    
    const closeMobileMenu = () => {
      mobileMenuOpen.value = false;
      document.body.classList.remove('mobile-menu-open');
    };
    
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value;
    };
    
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value;
      localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value);
    };
    
    const logout = async () => {
      try {
        await authStore.logout();
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    
    // Close user menu on click outside
    const handleClickOutside = (event) => {
      if (showUserMenu.value && !event.target.closest('.user-menu')) {
        showUserMenu.value = false;
      }
    };
    
    onMounted(() => {
      // Load sidebar state from localStorage
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        sidebarCollapsed.value = saved === 'true';
      }
      
      document.addEventListener('click', handleClickOutside);
    });
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      document.body.classList.remove('mobile-menu-open');
    });
    
    return {
      mobileMenuOpen,
      showUserMenu,
      sidebarCollapsed,
      appName,
      logo,
      user,
      userInitials,
      navigationItems,
      sidebarItems,
      currentYear,
      navigateToHome,
      isActiveRoute,
      toggleMobileMenu,
      closeMobileMenu,
      toggleUserMenu,
      toggleSidebar,
      logout
    };
  }
};
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--color-background, #fff);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.logo {
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary, #2e5b28);
}

.logo img {
  height: 40px;
  width: auto;
}

.main-nav ul {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.main-nav a {
  text-decoration: none;
  color: var(--color-text, #1f2937);
  transition: color 0.2s;
}

.main-nav a:hover,
.main-nav a.active {
  color: var(--color-primary, #2e5b28);
}

.user-menu {
  position: relative;
}

.user-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary, #2e5b28);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 100;
}

.dropdown-menu a,
.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text, #1f2937);
  text-decoration: none;
}

.dropdown-menu a:hover,
.dropdown-menu button:hover {
  background: var(--color-neutral, #f3f4f6);
}

.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-button span {
  display: block;
  width: 25px;
  height: 3px;
  background: var(--color-text, #1f2937);
  margin: 5px 0;
  transition: 0.3s;
}

.app-sidebar {
  position: fixed;
  left: 0;
  top: 73px;
  bottom: 0;
  width: 250px;
  background: var(--color-background, #fff);
  border-right: 1px solid var(--color-border, #e5e7eb);
  transition: width 0.3s;
  overflow-y: auto;
  z-index: 900;
}

.app-sidebar.collapsed {
  width: 70px;
}

.collapse-button {
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary, #2e5b28);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.sidebar-nav ul {
  list-style: none;
  padding: 1rem 0;
  margin: 0;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--color-text, #1f2937);
  transition: background 0.2s;
}

.sidebar-nav a:hover {
  background: var(--color-neutral, #f3f4f6);
}

.sidebar-nav i {
  width: 20px;
  text-align: center;
}

.app-main {
  flex: 1;
  margin-left: 250px;
  margin-top: 73px;
  padding: 2rem;
  transition: margin-left 0.3s;
}

.app-sidebar.collapsed ~ .app-main {
  margin-left: 70px;
}

.app-footer {
  margin-left: 250px;
  padding: 1rem 2rem;
  background: var(--color-background, #fff);
  border-top: 1px solid var(--color-border, #e5e7eb);
  text-align: center;
}

.app-sidebar.collapsed ~ .app-footer {
  margin-left: 70px;
}

/* Responsive */
@media (max-width: 768px) {
  .main-nav {
    display: none;
  }
  
  .mobile-menu-button {
    display: block;
  }
  
  .app-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .mobile-menu-open .app-sidebar {
    transform: translateX(0);
  }
  
  .app-main,
  .app-footer {
    margin-left: 0 !important;
  }
  
  .app-sidebar.collapsed ~ .app-main,
  .app-sidebar.collapsed ~ .app-footer {
    margin-left: 0;
  }
}
</style>