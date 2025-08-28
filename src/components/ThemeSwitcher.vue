<template>
  <div class="relative" ref="container">
    <!-- Button to open the theme menu -->
    <button
      @click="isOpen = !isOpen"
      class="h-10 w-10 p-2 rounded-full text-muted hover-bg-effect icon-trigger flex items-center justify-center"
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
        class="absolute left-0 bottom-12 z-20 w-56 rounded-xl shadow-lg border"
        :class="[menuClass]"
        @click.outside="closeOnOutside"
      >
        <div class="px-3 py-2 text-xs font-semibold opacity-70">Theme</div>

        <button
          class="menu-item"
          :class="{ active: theme === 'system' }"
          @click="setTheme('system')"
        >
          <span class="material-icons-outlined">settings_suggest</span>
          System
        </button>

        <button
          class="menu-item"
          :class="{ active: theme === 'light' }"
          @click="setTheme('light')"
        >
          <span class="material-icons-outlined">light_mode</span>
          Light
        </button>

        <button
          class="menu-item"
          :class="{ active: theme === 'dark' }"
          @click="setTheme('dark')"
        >
          <span class="material-icons-outlined">dark_mode</span>
          Dark
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isOpen = ref(false)
const theme = ref('system')

const container = ref(null)
const closeOnOutside = (e) => {
  if (container.value && !container.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutside)
})

function setTheme(mode) {
  theme.value = mode
  document.documentElement.classList.remove('light', 'dark')
  if (mode === 'light') document.documentElement.classList.add('light')
  if (mode === 'dark') document.documentElement.classList.add('dark')
  isOpen.value = false
}

const menuClass =
  'bg-[var(--c-panel)] border-[var(--c-border)] text-[var(--c-text-primary)]'
</script>

<style scoped>
.menu-item {
  width: 100%;
  height: 40px;
  display: grid;
  grid-template-columns: 24px 1fr;
  column-gap: 10px;
  align-items: center;
  padding: 0 12px;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--c-text-primary);
}
.menu-item:hover {
  background-color: var(--c-bg-hover);
  color: var(--c-text-accent);
}
.menu-item.active {
  color: var(--c-text-brand);
}
.hover-bg-effect:hover {
  background-color: var(--c-bg-hover);
  color: var(--c-text-accent);
}
</style>
