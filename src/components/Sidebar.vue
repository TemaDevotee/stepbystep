<template>
  <div
    :class="[{ 'w-20': collapsed, 'w-72': !collapsed, collapsed, animating, collapsing }]"
    class="sidebar h-full flex flex-col transition-all duration-300 overflow-visible"
    style="transition: width .30s ease;"
  >
    <!-- Header: brand + toggle -->
    <div class="flex items-center justify-between py-4 pl-6 pr-4">
      <router-link to="/" class="brand" aria-label="Trickster">
        <span class="brand__logo-box">
          <img :src="currentLogo" alt="" class="brand__logo" />
        </span>
        <span
          class="label brand-text text-2xl font-bold"
          v-measure-label
          :aria-hidden="collapsed ? 'true' : 'false'"
        >
          Trickster
        </span>
      </router-link>

      <button
        type="button"
        @click="toggle"
        :aria-expanded="(!collapsed).toString()"
        aria-controls="sidebar-navigation"
        class="flex items-center justify-center h-10 w-10 rounded-full hover-bg-effect transition-colors"
        title="Toggle sidebar"
      >
        <span class="material-icons">{{ collapsed ? 'menu_open' : 'menu' }}</span>
      </button>
    </div>

    <!-- Navigation -->
    <nav id="sidebar-navigation" class="flex-1 mt-4" aria-label="Primary">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[ 'nav-link', { active: isActiveRoute(item.to), collapsed } ]"
        :title="collapsed ? t(item.key) : ''"
      >
        <span class="nav-icon material-icons" aria-hidden="true">{{ item.icon }}</span>
        <span class="label nav-text" v-measure-label :aria-hidden="collapsed ? 'true' : 'false'">
          {{ t(item.key) }}
        </span>
      </router-link>
    </nav>

    <!-- Footer controls -->
    <div class="pb-6 px-4 mt-auto">
      <div class="flex flex-col gap-2" >
        <div class="footer-row"><ThemeSwitcher /></div>
        <div class="footer-row"><LanguageSwitcher /></div>

        <!-- Dark / Light toggle -->
        <div class="footer-row">
        <button
          @click="themeStore.toggleDarkMode()"
          :title="themeStore.isDarkMode ? t('lightMode') : t('darkMode')"
          class="h-10 w-10 rounded-full hover-bg-effect text-muted transition-colors flex items-center justify-center"
          type="button"
        >
          <span class="material-icons">{{ themeStore.isDarkMode ? 'dark_mode' : 'light_mode' }}</span>
        </button>
      </div>

        <!-- Logout -->
        <div class="footer-row">
        <button
          @click="handleLogout"
          :title="t('logout')"
          class="h-10 w-10 rounded-full hover-bg-effect text-muted transition-colors flex items-center justify-center"
          type="button"
        >
          <span class="material-icons">logout</span>
        </button>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { themeStore } from '@/stores/ThemingStore.js'
import { langStore } from '@/stores/langStore.js'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import vMeasureLabel from '@/directives/v-measure-label.js'

// collapsed state with persistence
const STORAGE_KEY = 'sidebar:collapsed'
const collapsed = ref(localStorage.getItem(STORAGE_KEY) === '1')
const animating = ref(false)
const collapsing = ref(false)
const toggle = () => {
  animating.value = true
  const wasExpanded = !collapsed.value
  collapsing.value = wasExpanded // apply fade only when closing
  collapsed.value = !collapsed.value
  localStorage.setItem(STORAGE_KEY, collapsed.value ? '1' : '0')
  window.clearTimeout(toggle._t)
  toggle._t = window.setTimeout(() => { animating.value = false; collapsing.value = false }, 320)
}

// nav items (keep your existing set)
const navItems = [
  { key: 'chats', to: '/chats', icon: 'chat' },
  { key: 'agents', to: '/agents', icon: 'psychology' },
  { key: 'knowledge', to: '/knowledge', icon: 'library_books' },
  { key: 'account', to: '/account', icon: 'account_circle' },
]

const route = useRoute()
const isActiveRoute = (to) => route.path === to || route.path.startsWith(to + '/')
const t = langStore.t

// theme-based logo
const currentLogo = computed(() => {
  const id =
    document.documentElement.dataset.themeId ||
    document.documentElement.getAttribute('data-theme') ||
    'classic'
  if (id === 'classic') return new URL('../assets/logos/logo-classic.svg', import.meta.url).href
  if (id === 'sapphire' || id === 'graphite') return new URL('../assets/logos/logo-sapphire.svg', import.meta.url).href
  return new URL('../assets/logos/logo-classic.svg', import.meta.url).href
})

// logout -> clear storage + reload
const handleLogout = () => {
  try {
    localStorage.clear()
    sessionStorage.clear()
  } catch (e) {
    console.warn('Error clearing storage on logout', e)
  }
  window.location.assign('/')
}
</script>

<style scoped>
.sidebar {
  background-color: var(--c-bg-sidebar);
  border-right: 1px solid var(--c-border);
}

/* Brand row uses same 24px icon column so logo aligns with nav icons */
.brand {
  display: grid;
  grid-template-columns: 24px 1fr;
  column-gap: 12px;
  align-items: center;
  padding-left: 0; /* already inside pl-6 wrapper */
  text-decoration: none;
}
.brand__logo-box { width: 24px; height: 20px; display: inline-grid; align-items: center; }
.brand__logo { height: 20px; width: auto; display: block; }

/* Nav items: 24px icon column + text column; fixed paddings */
.nav-link {
  display: grid;
  grid-template-columns: 24px 1fr;
  column-gap: 12px;
  align-items: center;
  height: 48px;
  padding-left: 24px;  /* pl-6 */
  padding-right: 16px; /* pr-4 */
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: var(--c-text-primary);
  border-radius: 0.75rem;
  text-decoration: none;
}
.nav-link:hover {
  background-color: var(--c-bg-hover);
  color: var(--c-text-accent);
}
.nav-link.active {
  background-color: var(--c-bg-active);
  color: var(--c-text-accent);
}
.material-icons { font-size: 20px; line-height: 20px; }
.nav-icon { justify-self: start; width: 24px; }

/* Collapsing labels with soft fade at right edge */
.label {
  display: inline-block;
  white-space: nowrap;
  overflow: visible; /* no clipping in static state */
  width: var(--w, auto);
  opacity: 1;
  transition: width .30s ease, opacity .20s ease, margin .30s ease, transform .30s ease;
  -webkit-mask-image: linear-gradient(to left, #000 calc(100% - 12px), transparent);
          mask-image: linear-gradient(to left, #000 calc(100% - 12px), transparent);
}
.brand-text { margin-left: 0.75rem; } /* matches ml-3 */
.nav-text { }

/* Collapsed -> hide labels, icons stay put */
.sidebar.collapsed .label {
  width: 0;
  opacity: 0;
  margin-left: 0;
  transform: translateX(-4px);
}

/* Footer buttons */
.hover-bg-effect:hover {
  background-color: var(--c-bg-hover);
  color: var(--c-text-accent);
}

/* Footer rows use the same 24px icon column so icons align perfectly with nav */
.footer-row{
  display:grid;
  grid-template-columns:24px 1fr;
  column-gap:12px;
  align-items:center;
  height:48px;
  padding-left:24px; /* pl-6 */
  padding-right:16px; /* pr-4 */
}
/* Make the inner trigger span the row with the same grid & paddings */
.footer-row :deep(button){
  width:100%;
  height:48px;
  display:grid;
  grid-template-columns:24px 1fr;
  column-gap:12px;
  padding:0; /* outer row already has paddings */
  background:transparent;
  border:none;
}
.footer-row :deep(.material-icons),
.footer-row :deep(.material-icons-outlined){
  font-size:20px;
  line-height:20px;
  justify-self:start;
}


/* Footer: force full-row hover background and same radius as nav */
.footer-row :deep(button){
  width:100%;
  height:48px;
  display:grid;
  grid-template-columns:24px 1fr;
  column-gap:12px;
  padding:0 !important;
  background:transparent;
  border:none;
  border-radius: 0.75rem !important; /* match nav */
}
.footer-row :deep(button:hover){
  background-color: var(--c-bg-hover) !important;
  color: var(--c-text-accent) !important;
}
.footer-row :deep(.material-icons),
.footer-row :deep(.material-icons-outlined){
  font-size:20px;
  line-height:20px;
  justify-self:start;
  width:24px;
}

</style>
