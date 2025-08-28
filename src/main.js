import './main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { workspaceStore } from '@/stores/workspaceStore'

const app = createApp(App)
app.use(router)
app.mount('#app')

// ensure workspace store initializes and persists
void workspaceStore
