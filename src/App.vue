<template>
  <div class="flex h-screen">
    <Sidebar
      :class="[
        'transition-transform duration-300 z-50',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'fixed inset-y-0 left-0 sm:static sm:translate-x-0'
      ]"
    />
    <main class="flex-1 flex flex-col overflow-y-auto">
      <!-- Hamburger for mobile -->
      <header class="sm:hidden p-4">
        <button
          @click="mobileSidebarOpen = true"
          class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <span class="material-icons">menu</span>
        </button>
      </header>
      <RouterView />
    </main>
    <SidePanel />
    <!-- Global toast notifications -->
    <ToastNotification />
    <div
      v-if="mobileSidebarOpen"
      class="fixed inset-0 bg-black/50 sm:hidden"
      @click="mobileSidebarOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import SidePanel from '@/components/SidePanel.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const mobileSidebarOpen = ref(false)
</script>
