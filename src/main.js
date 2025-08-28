import './main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { workspaceStore } from '@/stores/workspaceStore'
import { themeStore } from '@/stores/ThemingStore.js'

// Initialize theme before app mount to prevent visual flicker
themeStore.init()

const app = createApp(App)
app.use(router)
app.mount('#app')

// ensure workspace store initializes and persists
void workspaceStore
