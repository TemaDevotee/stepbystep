<template>
  <div class="relative" ref="container">
    <!-- Icon-only trigger button -->
    <button
      ref="trigger"
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

    <!-- Dropdown menu (teleported to body) -->
    <teleport to="body">
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
          ref="menu"
          class="theme-dropdown floating"
          :style="floatingStyle"
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
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

const isOpen = ref(false)
const currentTheme = ref('classic')
const container = ref(null)
const trigger = ref(null)
const menu = ref(null)
const router = useRouter()

const close = () => { isOpen.value = false }

function closeOnOutside(e) {
  const t = e.target
  if (container.value?.contains(t)) return
  if (menu.value?.contains(t)) return
  isOpen.value = false
}

// Close menu on route change
const unsubscribeRouter = router.afterEach(() => { isOpen.value = false })

// Canonical theme switching logic
function applyTheme(theme) {
  if (theme !== 'classic' && theme !== 'sapphire') theme = 'classic'
  document.documentElement.setAttribute('data-theme', theme)
  try { localStorage.setItem('app:theme', theme) } catch {}
  currentTheme.value = theme
}
function resolveInitialTheme() {
  const fromDom = document.documentElement.getAttribute('data-theme')
  const fromStore = localStorage.getItem('app:theme')
  const candidate = fromDom || fromStore || 'classic'
  return candidate === 'sapphire' ? 'sapphire' : 'classic'
}
function setTheme(themeName) {
  if (themeName !== 'classic' && themeName !== 'sapphire') return
  applyTheme(themeName)
  isOpen.value = false
}

// ---- floating positioning (fixed; teleported to body)
const floatingStyle = ref({})
const GAP = 10
function positionFloating() {
  const el = trigger.value
  if (!el) return
  const r = el.getBoundingClientRect()
  floatingStyle.value = {
    position: 'fixed',
    left: `${r.right + GAP}px`,
    top: `${r.top + r.height / 2}px`,
    transform: 'translateY(-50%)',
    zIndex: 10000
  }
}
function onAnyScroll() { if (isOpen.value) positionFloating() }
function onResize() { if (isOpen.value) positionFloating() }
watch(isOpen, async (v) => { if (v) { await nextTick(); positionFloating() } })

onMounted(() => {
  document.addEventListener('click', closeOnOutside)
  window.addEventListener('scroll', onAnyScroll, true)
  window.addEventListener('resize', onResize)

  // Initialize theme on mount
  applyTheme(resolveInitialTheme())
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutside)
  window.removeEventListener('scroll', onAnyScroll, true)
  window.removeEventListener('resize', onResize)
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
  overflow: visible; /* для круглой подложки */
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
  pointer-events: auto;
  z-index: 0;           /* под иконкой */
}
.icon:hover::before, .icon:focus-visible::before { opacity: 1; }
.icon:hover { color: var(--c-text-accent, var(--accent)); }

/* Focus ring matches icon circle */
.icon:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-round, 999px);
}

/* Dropdown base look */
.theme-dropdown {
  min-width: 180px;
  padding: 8px;
  border-radius: 12px;
  background: var(--c-bg-secondary);
  border: 1px solid var(--c-border);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / .1);
}

/* Teleported: fixed on viewport */
.theme-dropdown.floating { position: fixed; z-index: 10000; }

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
.menu-item:hover { background-color: var(--c-bg-hover); color: var(--c-text-accent); }
.menu-item.active { color: var(--c-text-brand); }

@media (prefers-reduced-motion: reduce) {
  .icon, .icon::before { transition: opacity 120ms ease; }
}
</style>
