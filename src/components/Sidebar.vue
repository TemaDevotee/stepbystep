<template>
  <div
    ref="sidebarRef"
    :class="[
      'sidebar',
      { 
        'sidebar--collapsed': collapsed,
        'sidebar--animating': animating,
        'sidebar--collapsing': collapsing
      }
    ]"
  >
    <!-- Brand Section -->
    <SidebarBrand
      :collapsed="collapsed"
      :logo="currentLogo"
      @expand="expandSidebar"
      @navigate="navigateToDashboard"
    />

    <!-- Navigation Section -->
    <SidebarSection class="sidebar__navigation" aria-label="Primary navigation">
      <SidebarItem
        v-for="item in navItems"
        :key="item.to"
        :collapsed="collapsed"
        :item="item"
        :is-active="isActiveRoute(item.to)"
        :label="t(item.key)"
      />
    </SidebarSection>

    <!-- Utilities Section -->
    <SidebarSection class="sidebar__utilities">
      <template v-for="utility in utilities" :key="utility.id">
        <SidebarUtility v-if="utility.slot">
          <component :is="utility.component" />
        </SidebarUtility>
        <SidebarUtility
          v-else
          :icon="utility.icon"
          :aria-label="utility.ariaLabel"
          :title="utility.title"
          @click="utility.action"
        />
      </template>
    </SidebarSection>

    <!-- Collapse Toggle (only visible when expanded) -->
    <button
      v-if="!collapsed"
      @click="toggle"
      class="sidebar__toggle"
      :aria-expanded="(!collapsed).toString()"
      aria-controls="sidebar-navigation"
      :title="t('toggleSidebar')"
    >
      <span class="material-icons">chevron_left</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { themeStore } from '@/stores/ThemingStore.js'
import { langStore } from '@/stores/langStore.js'
import SidebarBrand from '@/components/SidebarBrand.vue'
import SidebarSection from '@/components/SidebarSection.vue'
import SidebarItem from '@/components/SidebarItem.vue'
import SidebarUtility from '@/components/SidebarUtility.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

// State management
const STORAGE_KEY = 'sidebar:collapsed'
const collapsed = ref(localStorage.getItem(STORAGE_KEY) === 'true')
const animating = ref(false)
const collapsing = ref(false)
const sidebarRef = ref(null)

// Animation control
const toggle = () => {
  animating.value = true
  collapsing.value = !collapsed.value // true when collapsing
  collapsed.value = !collapsed.value
  localStorage.setItem(STORAGE_KEY, collapsed.value.toString())
  
  setTimeout(() => {
    animating.value = false
    collapsing.value = false
  }, 200) // Match CSS transition duration
}

// Brand actions
const expandSidebar = () => {
  if (collapsed.value) {
    collapsed.value = false
    localStorage.setItem(STORAGE_KEY, 'false')
  }
}

const route = useRoute()
const router = useRouter()

const navigateToDashboard = () => {
  router.push('/')
}

// Navigation items
const navItems = [
  { key: 'chats', to: '/chats', icon: 'chat' },
  { key: 'agents', to: '/agents', icon: 'psychology' },
  { key: 'knowledge', to: '/knowledge', icon: 'library_books' },
  { key: 'account', to: '/account', icon: 'account_circle' },
]

const isActiveRoute = (to) => route.path === to || route.path.startsWith(to + '/')
const t = langStore.t

// Utility actions
const toggleDarkMode = () => {
  themeStore.toggleDarkMode()
}

const handleLogout = () => {
  try {
    localStorage.clear()
    sessionStorage.clear()
  } catch (e) {
    console.warn('Error clearing storage on logout', e)
  }
  window.location.assign('/')
}

// Utilities array - exactly 4 utilities, some with dropdowns (slotted), others icon-only
const utilities = computed(() => [
  {
    id: 'language',
    slot: true,
    component: LanguageSwitcher
  },
  {
    id: 'theme',
    slot: true,
    component: ThemeSwitcher
  },
  {
    id: 'darkMode',
    icon: themeStore.isDarkMode ? 'dark_mode' : 'light_mode',
    ariaLabel: themeStore.isDarkMode ? t('lightMode') : t('darkMode'),
    title: themeStore.isDarkMode ? t('lightMode') : t('darkMode'),
    action: toggleDarkMode
  },
  {
    id: 'logout',
    icon: 'logout',
    ariaLabel: t('logout'),
    title: t('logout'),
    action: handleLogout
  }
])

// Theme-based logo
const currentLogo = computed(() => {
  const themeId = document.documentElement.getAttribute('data-theme') || 'classic'
  const logoMap = {
    classic: new URL('../assets/logos/logo-classic.svg', import.meta.url).href,
    sapphire: new URL('../assets/logos/logo-sapphire.svg', import.meta.url).href,
    graphite: new URL('../assets/logos/logo-sapphire.svg', import.meta.url).href
  }
  return logoMap[themeId] || logoMap.classic
})
</script>

<style scoped>
/* CSS Custom Properties for Geometry Tokens */
.sidebar {
  --collapsed-width: 72px;
  --expanded-width: 256px;
  --icon-size: 24px;
  --icon-axis-x: calc(var(--collapsed-width) / 2); /* 36px */
  --left-gutter: calc(var(--icon-axis-x) - var(--icon-size) / 2); /* 24px */
  --row-height: 48px;
  --row-radius: 12px;
  --dropdown-gap: 10px;
  --radius-round: 999px;
  
  /* Theme integration */
  --sidebar-bg: var(--c-bg-sidebar, var(--surface));
  --sidebar-border: var(--c-border, color-mix(in oklab, var(--text) 8%, transparent));
  --hover-bg: var(--c-bg-hover, color-mix(in oklab, var(--accent) 14%, transparent));
  --active-bg: var(--c-bg-active, color-mix(in oklab, var(--accent) 20%, transparent));
  --focus-ring: color-mix(in oklab, var(--accent) 60%, transparent);
  
  /* Layout */
  width: var(--expanded-width);
  min-width: var(--expanded-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  position: relative;
  transition: width 200ms ease;
}

.sidebar--collapsed {
  width: var(--collapsed-width);
  min-width: var(--collapsed-width);
}

/* Navigation and Utilities Sections */
.sidebar__navigation {
  flex: 1;
  padding: 16px 0;
}

.sidebar__utilities {
  padding: 16px 0 24px 0;
  margin-top: auto;
  overflow: visible; /* Allow dropdowns to overflow */
}

/* Collapse Toggle */
.sidebar__toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--c-text-muted, var(--text));
  cursor: pointer;
  transition: background-color 200ms ease;
}

.sidebar__toggle:hover {
  background-color: var(--hover-bg);
  color: var(--c-text-accent, var(--accent));
}

.sidebar__toggle:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.sidebar__toggle .material-icons {
  font-size: 20px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .sidebar {
    transition: width 120ms ease;
  }
  
  .sidebar__toggle {
    transition: background-color 120ms ease;
  }
}
</style>
