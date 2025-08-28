<template>
  <div class="relative" ref="root">
    <button
      class="w-full flex items-center justify-between p-2 rounded hover-bg-effect min-h-[44px] text-base font-medium"
      @click="toggle"
      :aria-expanded="open.toString()"
    >
      <span class="truncate">{{ current?.name }}</span>
      <span class="material-icons">expand_more</span>
    </button>
    <div
      v-if="open"
      class="absolute z-50 mt-1 w-56 bg-secondary border border-default rounded-lg shadow max-h-60 overflow-y-auto"
    >
      <div v-if="workspaces.length > 7" class="p-2">
        <input
          v-model="query"
          type="text"
          placeholder="Поиск"
          class="w-full p-2 rounded border"
        />
      </div>
      <ul>
        <li v-for="ws in filtered" :key="ws.id">
          <button
            class="flex items-center justify-between w-full p-2 text-base font-medium hover:bg-hover text-left min-h-[44px]"
            @click="select(ws.id)"
          >
            <span class="truncate">{{ ws.name }}</span>
            <span v-if="!ws.isDefault" class="flex gap-1 ml-2">
              <span
                class="material-icons text-base"
                @click.stop="promptRename(ws)"
                title="Rename"
                >edit</span
              >
              <span
                class="material-icons text-base"
                @click.stop="confirmDelete(ws)"
                title="Delete"
                >delete</span
              >
            </span>
          </button>
        </li>
      </ul>
    </div>
    <ConfirmDialog
      v-if="dialog"
      v-bind="dialog"
      @confirm="dialog.onConfirm"
      @cancel="dialog = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { workspaceStore } from '@/stores/workspaceStore'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const open = ref(false)
const query = ref('')
const dialog = ref(null)
const root = ref(null)

const workspaces = workspaceStore.state.workspaces
const current = computed(() =>
  workspaces.find((w) => w.id === workspaceStore.state.currentWorkspaceId),
)
const filtered = computed(() =>
  workspaces.filter((w) =>
    w.name.toLowerCase().includes(query.value.toLowerCase()),
  ),
)

function toggle() {
  open.value = !open.value
}

function select(id) {
  workspaceStore.switchWorkspace(id)
  open.value = false
}

function promptRename(ws) {
  const name = prompt('Новое имя workspace', ws.name)
  if (name && name.trim()) {
    workspaceStore.renameWorkspace(ws.id, name.trim())
  }
}

function confirmDelete(ws) {
  dialog.value = {
    title: 'Удалить workspace?',
    body: 'Это действие нельзя отменить. Все чаты и команды этого workspace будут удалены.',
    confirmLabel: 'Удалить',
    cancelLabel: 'Отмена',
    onConfirm: () => {
      workspaceStore.deleteWorkspace(ws.id)
      dialog.value = null
    },
  }
}


function handleClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.bg-secondary {
  background-color: var(--c-bg-secondary);
}
.border-default {
  border-color: var(--c-border);
}
.hover\:bg-hover:hover,
.hover-bg-effect:hover {
  background-color: var(--c-bg-hover);
  color: var(--c-text-accent);
}
</style>
