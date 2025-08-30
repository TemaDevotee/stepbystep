<template>
  <div class="relative" ref="container">
    <!-- Icon-only trigger button -->
    <button
      class="icon"
      @click="isOpen = !isOpen"
      @keydown.escape="close"
      :title="`Current theme: ${currentTheme}`"
      :aria-expanded="isOpen.toString()"
      aria-haspopup="menu"
      aria-label="Theme"
    >
      <span class="material-icons-outlined">palette</span>
    </button>

    <!-- Dropdown menu -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="theme-dropdown"
        role="menu"
        @keydown.escape="close"
      >
        <div
          class="menu-item"
          :class="{ active: currentTheme === 'classic' }"
          @click="setTheme('classic')"
          @keydown.enter="setTheme('classic')"
          @keydown.space.prevent="setTheme('classic')"
          role="menuitem"
          tabindex="0"
        >
          Classic
        </div>

        <div
          class="menu-item"
          :class="{ active: currentTheme === 'sapphire' }"
          @click="setTheme('sapphire')"
          @keydown.enter="setTheme('sapphire')"
          @keydown.space.prevent="setTheme('sapphire')"
          role="menuitem"
          tabindex="0"
        >
          Sapphire
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const isOpen = ref(false)
const currentTheme = ref('classic')
const container = ref(null)
const router = useRouter()

const close = () => {
  isOpen.value = false
}

const closeOnOutside = (e) => {
  if (container.value && !container.value.contains(e.target)) {
    isOpen.value = false
  }
}

// Close menu on route change
const unsubscribeRouter = router.afterEach(() => {
  isOpen.value = false
})

// Canonical theme switching logic
function applyTheme(theme) {
  if (theme !== 'classic' && theme !== 'sapphire') {
    theme = 'classic' // fallback
  }
  
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem('app:theme', theme)
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error)
  }
  
  currentTheme.value = theme
}

function resolveInitialTheme() {
  const fromDom = document.documentElement.getAttribute('data-theme')
  const fromStore = localStorage.getItem('app:theme')
  const candidate = fromDom || fromStore || 'classic'
  return candidate === 'sapphire' ? 'sapphire' : 'classic'
}

function setTheme(themeName) {
  if (themeName !== 'classic' && themeName !== 'sapphire') {
    console.warn('Invalid theme name:', themeName)
    return
  }
  
  applyTheme(themeName)
  isOpen.value = false
  console.log('Theme switched to:', themeName)
}

onMounted(() => {
  document.addEventListener('click', closeOnOutside)
  
  // Initialize theme on mount
  const initialTheme = resolveInitialTheme()
  applyTheme(initialTheme)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutside)
  unsubscribeRouter()
})
</script>

<style scoped>
/* Icon-only interactive element */
.icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: grid;
  place-items: center;
  position: relative;
  cursor: pointer;
  background: transparent;
  border: none;
  color: var(--c-text-muted, var(--text));
  transition: color 200ms ease;

  /* позволяем подложке выходить за границы, не меняя лэйаут */
  overflow: visible;
}

.icon .material-icons-outlined {
  font-size: 20px;
  line-height: 20px;
  position: relative;
  z-index: 1;        /* иконка над подложкой */
  pointer-events: none;
}

/* Enlarged circular hover overlay + extended hit-area (matches brand) */
.icon::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--icon-size) + 12px);  /* +6px вокруг — как у бренда */
  height: calc(var(--icon-size) + 12px);
  transform: translate(-50%, -50%);
  border-radius: var(--radius-round, 999px);
  background: var(--hover-bg);
  opacity: 0;
  transition: opacity 150ms ease;

  /* расширяем реальную hit-area, клики доходят до кнопки */
  pointer-events: auto;
  z-index: 0;           /* под иконкой */
}

.icon:hover::before,
.icon:focus-visible::before {
  opacity: 1;
}

.icon:hover {
  color: var(--c-text-accent, var(--accent));
}

/* Focus ring matches icon circle */
.icon:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-round, 999px);
}

/* Dropdown menu positioned relative to icon */
.theme-dropdown {
  position: absolute;
  bottom: 0;
  left: calc(100% + var(--dropdown-gap, 10px));
  width: 128px;
  padding: 8px;
  border-radius: 12px;
  background: var(--c-bg-secondary);
  border: 1px solid var(--c-border);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / .1);
  z-index: 50;
}

/* Menu items */
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  color: var(--c-text-primary);
  transition: background-color 150ms ease, color 150ms ease;
}

.menu-item:hover {
  background-color: var(--c-bg-hover);
  color: var(--c-text-accent);
}

.menu-item.active {
  color: var(--c-text-brand);
}

@media (prefers-reduced-motion: reduce) {
  .icon,
  .icon::before {
    transition: opacity 120ms ease;
  }
  
  .theme-dropdown {
    transition: none;
  }
  
  .menu-item {
    transition: none;
  }
}
</style>
