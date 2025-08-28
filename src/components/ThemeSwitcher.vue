<template>
  <div class="relative" ref="container">
    <!-- Button to open the theme menu -->
    <button
      @click="isOpen = !isOpen"
      class="h-10 w-10 p-2 rounded-full text-muted flex items-center justify-center transition-colors duration-200 hover:bg-[var(--c-bg-hover)] hover:text-[var(--accent)]"
      :title="`Current theme: ${currentTheme}`"
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
        class="absolute bottom-0 left-full ml-2 w-32 p-2 rounded-xl shadow-lg menu-bg border border-default z-50"
      >
        <div
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer menu-item"
          :class="{ active: currentTheme === 'classic' }"
          @click="setTheme('classic')"
        >
          Classic
        </div>

        <div
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer menu-item"
          :class="{ active: currentTheme === 'sapphire' }"
          @click="setTheme('sapphire')"
        >
          Sapphire
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isOpen = ref(false)
const currentTheme = ref('classic')

const container = ref(null)
const closeOnOutside = (e) => {
  if (container.value && !container.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnOutside)
  
  const documentTheme = document.documentElement.getAttribute('data-theme')
  if (documentTheme === 'classic' || documentTheme === 'sapphire') {
    currentTheme.value = documentTheme
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutside)
})

function setTheme(themeName) {
  if (themeName !== 'classic' && themeName !== 'sapphire') {
    console.warn('Invalid theme name:', themeName)
    return
  }
  
  currentTheme.value = themeName
  document.documentElement.setAttribute('data-theme', themeName)
  
  try {
    localStorage.setItem('app:theme', themeName)
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error)
  }
  
  isOpen.value = false
  console.log('Theme switched to:', themeName)
}
</script>

<style scoped>
.menu-bg {
  background-color: var(--c-bg-secondary);
}
.border-default {
  border-color: var(--c-border);
}
.menu-item {
  color: var(--c-text-primary);
}
.menu-item:hover {
  background-color: var(--c-bg-hover);
  color: var(--c-text-accent);
}
.menu-item.active {
  color: var(--c-text-brand);
}
</style>