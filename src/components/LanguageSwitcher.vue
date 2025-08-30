<template>
  <div class="relative" ref="container">
    <!-- Icon-only trigger button -->
    <button
      ref="trigger"
      class="icon"
      @click="toggle"
      @keydown.escape="close"
      :aria-expanded="isOpen.toString()"
      aria-haspopup="menu"
      aria-label="Language"
      title="Language"
    >
      <span class="material-icons-outlined">language</span>
    </button>
    
    <!-- Dropdown menu (teleported to body so it isn't clipped by the sidebar) -->
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
          class="language-dropdown floating"
          :style="floatingStyle"
          role="menu"
          @keydown.escape="close"
        >
          <div
            @click="setLang('en')"
            @keydown.enter="setLang('en')"
            @keydown.space.prevent="setLang('en')"
            class="menu-item"
            :class="{ active: langStore.current === 'en' }"
            role="menuitem"
            tabindex="0"
          >
            English
          </div>
          <div
            @click="setLang('ru')"
            @keydown.enter="setLang('ru')"
            @keydown.space.prevent="setLang('ru')"
            class="menu-item"
            :class="{ active: langStore.current === 'ru' }"
            role="menuitem"
            tabindex="0"
          >
            Русский
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { langStore } from '@/stores/langStore.js';

// Local state to control dropdown visibility
const isOpen = ref(false);
const container = ref(null);
const trigger = ref(null);
const menu = ref(null);
const router = useRouter();

const toggle = () => { isOpen.value = !isOpen.value; };
const close = () => { isOpen.value = false; };

const setLang = (lang) => {
  langStore.setLang(lang);
  isOpen.value = false;
};

// ---- floating positioning (fixed; teleported to body)
const floatingStyle = ref({});
const GAP = 10; // должно совпадать с --dropdown-gap по смыслу

function positionFloating() {
  const el = trigger.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  floatingStyle.value = {
    position: 'fixed',
    left: `${r.right + GAP}px`,
    top: `${r.top + r.height / 2}px`,
    transform: 'translateY(-50%)',
    zIndex: 10000,
  };
}

function onAnyScroll() { if (isOpen.value) positionFloating(); }
function onResize() { if (isOpen.value) positionFloating(); }

watch(isOpen, async (v) => {
  if (v) { await nextTick(); positionFloating(); }
});

// Close the menu when clicking outside (including the teleported menu)
function onClickOutside(event) {
  const t = event.target;
  if (!container.value) return;
  if (container.value.contains(t)) return;  // click on trigger area
  if (menu.value && menu.value.contains(t)) return; // click inside menu
  isOpen.value = false;
}

// Close menu on route change
const unsubscribeRouter = router.afterEach(() => { isOpen.value = false; });

onMounted(() => {
  document.addEventListener('click', onClickOutside);
  window.addEventListener('scroll', onAnyScroll, true);
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
  window.removeEventListener('scroll', onAnyScroll, true);
  window.removeEventListener('resize', onResize);
  unsubscribeRouter();
});
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

  /* позволяем подложке выйти за границы без влияния на лэйаут */
  overflow: visible;
}

.icon .material-icons-outlined {
  font-size: 20px;
  line-height: 20px;
  position: relative;
  z-index: 1;         /* иконка поверх подложки */
  pointer-events: none;
}

/* Enlarged circular hover overlay + extended hit-area (match brand & theme switcher) */
.icon::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--icon-size) + 12px);  /* +6px вокруг */
  height: calc(var(--icon-size) + 12px);
  transform: translate(-50%, -50%);
  border-radius: var(--radius-round, 999px);
  background: var(--hover-bg);
  opacity: 0;
  transition: opacity 150ms ease;
  pointer-events: auto; /* расширяет реальную hit-area */
  z-index: 0;           /* под иконкой */
}

.icon:hover::before,
.icon:focus-visible::before { opacity: 1; }

.icon:hover { color: var(--c-text-accent, var(--accent)); }

/* Focus ring matches icon circle */
.icon:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-round, 999px);
}

/* Dropdown base look */
.language-dropdown {
  min-width: 180px;
  padding: 8px;
  border-radius: 12px;
  background: var(--c-bg-secondary);
  border: 1px solid var(--c-border);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / .1);
}

/* When teleported, we position it on the viewport */
.language-dropdown.floating { position: fixed; z-index: 10000; }

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
