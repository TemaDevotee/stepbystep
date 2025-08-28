<template>
  <div class="relative" ref="container">
    <!-- Icon-only trigger button -->
    <button
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
        class="language-dropdown"
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { langStore } from '@/stores/langStore.js';

// Local state to control dropdown visibility
const isOpen = ref(false);
const container = ref(null);
const router = useRouter();

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const setLang = (lang) => {
  langStore.setLang(lang);
  isOpen.value = false;
};

// Close the menu when clicking outside
function onClickOutside(event) {
  if (!container.value) return;
  if (!container.value.contains(event.target)) {
    isOpen.value = false;
  }
}

// Close menu on route change
const unsubscribeRouter = router.afterEach(() => {
  isOpen.value = false;
});

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
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
}

.icon .material-icons-outlined {
  font-size: 20px;
  line-height: 20px;
}

/* Icon-sized circular hover overlay */
.icon::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--radius-round, 999px);
  background: var(--hover-bg);
  opacity: 0;
  transition: opacity 150ms ease;
  pointer-events: none;
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
.language-dropdown {
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
  
  .language-dropdown {
    transition: none;
  }
  
  .menu-item {
    transition: none;
  }
}
</style>