import { reactive } from 'vue'
import { showToast } from '@/stores/toastStore'

const STORAGE_KEY = 'app.state.v2'

function createDefaultWorkspace() {
  return {
    id: crypto.randomUUID(),
    name: 'Workspace 1',
    createdAt: Date.now(),
    isDefault: true,
    connections: [],
    access: {},
  }
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed.workspaces) {
        return parsed
      }
      // legacy single-workspace data migration
      const def = createDefaultWorkspace()
      return {
        currentWorkspaceId: def.id,
        workspaces: [def],
        chatsByWs: { [def.id]: parsed.chats || [] },
        teamsByWs: { [def.id]: parsed.teams || [] },
        bots: parsed.bots || [],
        knowledge: parsed.knowledge || [],
        __version: 2,
      }
    } catch (e) {
      console.warn('Failed to parse state', e)
    }
  }
  const def = createDefaultWorkspace()
  return {
    currentWorkspaceId: def.id,
    workspaces: [def],
    chatsByWs: { [def.id]: [] },
    teamsByWs: { [def.id]: [] },
    bots: [],
    knowledge: [],
    __version: 2,
  }
}

const state = reactive(loadState())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function switchWorkspace(id) {
  state.currentWorkspaceId = id
  persist()
}

function createWorkspace() {
  const ws = {
    id: crypto.randomUUID(),
    name: `Workspace ${state.workspaces.length + 1}`,
    createdAt: Date.now(),
    connections: [],
    access: {},
  }
  state.workspaces.push(ws)
  state.chatsByWs[ws.id] = []
  state.teamsByWs[ws.id] = []
  switchWorkspace(ws.id)
  showToast(`Workspace "${ws.name}" создан`, 'success')
  return ws
}

function renameWorkspace(id, name) {
  const ws = state.workspaces.find((w) => w.id === id)
  if (ws) {
    ws.name = name
    persist()
  }
}

function deleteWorkspace(id) {
  const index = state.workspaces.findIndex((w) => w.id === id)
  if (index === -1) return
  if (state.workspaces[index].isDefault) return
  state.workspaces.splice(index, 1)
  delete state.chatsByWs[id]
  delete state.teamsByWs[id]
  if (state.currentWorkspaceId === id) {
    const def = state.workspaces.find((w) => w.isDefault) || state.workspaces[0]
    state.currentWorkspaceId = def.id
  }
  persist()
}

function workspaceName(id) {
  return state.workspaces.find((w) => w.id === id)?.name || ''
}

export const workspaceStore = {
  state,
  createWorkspace,
  renameWorkspace,
  deleteWorkspace,
  switchWorkspace,
  workspaceName,
}
