<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-default"
    >
      <div class="flex items-center space-x-4">
        <!-- Back button left -->
        <router-link to="/chats" class="btn-secondary">
          <span class="material-icons-outlined mr-1">arrow_back</span>
          {{ langStore.t('backToAll') }}
        </router-link>
        <div>
          <h2 class="text-xl font-bold">
            {{ chat?.clientName || langStore.t('chat') }}
          </h2>
          <!-- Subtitle: display assigned agent when available -->
          <p class="text-sm text-muted" v-if="chat">
            <template v-if="assignedAgent">
              <span>{{ langStore.t('assignedAgent') }}:</span>
              <router-link
                :to="`/agents/${assignedAgent.id}`"
                class="text-link ml-1 hover:underline"
              >{{ assignedAgent.name }}</router-link>
            </template>
            <template v-else>
              {{ subtitle }}
            </template>
          </p>
        </div>
      </div>
      <!-- Compact action icons: resolve and end -->
      <div v-if="chat" class="flex items-center space-x-1">
        <button
          v-if="chat.status === 'live'"
          @click="resolveIssue"
          class="btn-secondary flex items-center space-x-1 px-3 py-2"
        >
          <span class="material-icons-outlined">check_circle</span>
          <span>{{ langStore.t('resolve') }}</span>
        </button>
        <button
          v-if="chat.status === 'live' || chat.status === 'resolved'"
          @click="endChat"
          class="btn-secondary flex items-center space-x-1 px-3 py-2"
        >
          <span class="material-icons-outlined">highlight_off</span>
          <span>{{ langStore.t('end') }}</span>
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 p-6 overflow-y-auto space-y-4 bg-secondary">
      <div v-if="!chat" class="text-center text-muted mt-10">
        {{ langStore.t('selectChat') }}
      </div>
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="flex"
        :class="messageAlignment(msg.sender)"
      >
        <div :class="messageBubbleClasses(msg.sender)">
          <p class="text-sm whitespace-pre-wrap">{{ msg.text }}</p>
          <span class="text-xs block mt-1">{{ formatMessageTime(msg.time) }}</span>
        </div>
      </div>
    </div>

    <!-- Message input and actions (bottom) -->
    <div class="p-4 border-t border-default bg-secondary">
      <!-- Input row: always shown -->
      <div class="flex items-center mb-2">
        <input
          v-model="newMessage"
          type="text"
          :disabled="!inputEnabled"
          :placeholder="placeholderText"
          class="flex-1 form-input mr-3"
          @keyup.enter="sendMessage"
        />
        <button
          class="btn-primary"
          :disabled="!inputEnabled || !newMessage"
          @click="sendMessage"
        >
          {{ langStore.t('send') }}
        </button>
      </div>
      <!-- Interfere action: appears below the input when the chat is awaiting attention -->
      <!-- Interfere/Return toggle: always display both actions.  The active
           action is highlighted with the primary button style; the inactive
           action uses the secondary style and is disabled. -->
      <div v-if="chat && chat.status !== 'resolved' && chat.status !== 'idle'" class="flex space-x-2">
        <!-- Interfere button: enabled when operator has not yet taken control and the chat requires attention -->
        <button
          :class="[ inputEnabled ? 'btn-secondary' : 'btn-primary', 'flex items-center space-x-1' ]"
          :disabled="inputEnabled || chat.status !== 'attention'"
          @click="interfere"
        >
          <span class="material-icons-outlined text-base">psychology</span>
          <span>{{ langStore.t('interfere') }}</span>
        </button>
        <!-- Return control button: enabled when operator is currently controlling the chat -->
        <button
          :class="[ inputEnabled ? 'btn-primary' : 'btn-secondary', 'flex items-center space-x-1' ]"
          :disabled="!inputEnabled"
          @click="returnControl"
        >
          <span class="material-icons-outlined text-base">undo</span>
          <span>{{ langStore.t('returnToAgent') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import langStore from '@/stores/langStore.js';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api';
import { showToast } from '@/stores/toastStore';

const route = useRoute();
const router = useRouter();
const chatId = route.params.id;

const chat = ref(null);
const messages = ref([]);
const newMessage = ref('');
// Indicates whether the operator has taken control of the chat.  When false,
// messages cannot be sent and the Interfere button is shown.
const inputEnabled = ref(false);
// Agents list is used to determine the assigned agent for the chat.  We fetch
// this once on mount.  In a real backend the chat object may reference
// agentId; here we simply pick the first available agent as the assignment.
const agentsList = ref([]);
const subtitle = computed(() => (chat.value ? `ID: ${chatId}` : ''));

// Dynamic placeholder text for the message input.  When the operator has not yet
// interfered in a chat requiring attention, instruct the user to press the
// "Interfere" button.  Otherwise, show a generic prompt.  The translation
// function is used where available.
const placeholderText = computed(() => {
  if (inputEnabled.value) {
    return langStore.t('typeMessage');
  }
  // Fallback strings; a translation key 'pressInterfere' can be provided.
  return langStore.t('pressInterfere');
});

async function fetchChat() {
  try {
    const res = await apiClient.get(`/chats/${chatId}`);
    chat.value = res.data;
    messages.value = res.data.messages || [];
    inputEnabled.value = chat.value.status === 'live';
  } catch (err) {
    console.error(err);
  }
}

// Fetch chat and agents when the component mounts
onMounted(() => {
  fetchChat();
  fetchAgents();
});

async function fetchAgents() {
  try {
    const res = await apiClient.get('/agents');
    agentsList.value = res.data;
  } catch (e) {
    console.error('Failed to fetch agents:', e);
  }
}

// Adjust alignments: client left; bot and operator right; system center
const messageAlignment = (sender) => {
  if (sender === 'client') return 'justify-start';
  if (sender === 'bot' || sender === 'operator') return 'justify-end';
  if (sender === 'system') return 'justify-center';
  return 'justify-start';
};

const messageBubbleClasses = (sender) => {
  if (sender === 'client') {
    return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg shadow';
  }
  if (sender === 'bot') {
    return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg shadow';
  }
  if (sender === 'operator') {
    return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg shadow';
  }
  if (sender === 'system') {
    return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 italic px-4 py-2 rounded-lg';
  }
  return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg';
};

// Compute the agent assigned to this chat.  If the chat object contains
// an agentId property, find that agent; otherwise return the first agent
// in the list.  If no agents exist return null.
const assignedAgent = computed(() => {
  if (!agentsList.value || agentsList.value.length === 0) return null;
  // If chat has an agentId property, match it
  if (chat.value && chat.value.agentId) {
    return agentsList.value.find((a) => a.id === chat.value.agentId) || null;
  }
  // Fallback: first agent
  return agentsList.value[0] || null;
});

// Format a message timestamp based on the current locale.  The backend
// stores times as locale strings in the default locale (e.g. '12:34:56').
// To provide consistency with the selected language, attempt to parse the
// time and reformat using toLocaleTimeString for 'ru-RU' or 'en-US'.  If
// parsing fails return the original value.
function formatMessageTime(timeStr) {
  if (!timeStr) return '';
  // If the string includes ':' assume HH:MM or HH:MM:SS; prefix a date
  // so the Date constructor can parse it in UTC.
  if (/\d+:\d+/.test(timeStr)) {
    const date = new Date(`1970-01-01T${timeStr}`);
    if (!isNaN(date)) {
      const locale = langStore.current === 'ru' ? 'ru-RU' : 'en-US';
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
  }
  return timeStr;
}

async function sendMessage() {
  if (!newMessage.value) return;
  try {
    await apiClient.post(`/chats/${chatId}/messages`, {
      sender: 'operator',
      text: newMessage.value,
    });
    messages.value.push({
      sender: 'operator',
      text: newMessage.value,
      time: new Date().toLocaleTimeString(),
    });
    newMessage.value = '';
    showToast(langStore.t('messageSent'), 'success');
  } catch (e) {
    showToast(langStore.t('messageSendFailed'), 'error');
  }
}

async function interfere() {
  try {
    await apiClient.post(`/chats/${chatId}/interfere`);
    inputEnabled.value = true;
    chat.value.status = 'live';
    await fetchChat();
    showToast(langStore.t('joinedChat'), 'success');
  } catch (e) {
    showToast(langStore.t('failedInterfere'), 'error');
  }
}

// Return control to the assigned agent.  This disables the input and
// notifies the user.  In a real backend you would update the chat status
// accordingly.  Here we simply disable the input and show a toast.
function returnControl() {
  // Disable input and mark the chat as requiring attention again so the operator
  // can re-interfere later.  Update the chat status locally to 'attention'
  // so the Interfere button becomes active again.
  inputEnabled.value = false;
  if (chat.value) {
    chat.value.status = 'attention';
  }
  showToast(langStore.t('controlReturned'), 'success');
}

async function resolveIssue() {
  try {
    await apiClient.post(`/chats/${chatId}/resolve`);
    inputEnabled.value = false;
    chat.value.status = 'resolved';
    await fetchChat();
    showToast(langStore.t('issueResolvedMsg'), 'success');
  } catch (e) {
    showToast(langStore.t('failedResolve'), 'error');
  }
}

async function endChat() {
  try {
    await apiClient.post(`/chats/${chatId}/end`);
    showToast(langStore.t('chatEndedMsg'), 'success');
    router.push('/chats');
  } catch (e) {
    showToast(langStore.t('failedEndChat'), 'error');
  }
}
</script>

<style scoped>
.bg-secondary {
  background-color: var(--c-bg-secondary);
}
.text-muted {
  color: var(--c-text-secondary);
}
.border-default {
  border-color: var(--c-border);
}
.form-input {
  @apply w-full p-2.5 rounded-lg border;
  background-color: var(--c-bg-input, var(--c-bg-primary));
  border-color: var(--c-border);
}
.form-input:focus {
  @apply ring-2 border-transparent outline-none;
  --tw-ring-color: var(--c-text-brand);
}

/* Compact icon button used for chat actions (resolve/end).  Sized at 40px with a rounded shape. */
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  color: var(--c-text-primary);
  transition: background-color 0.15s ease, color 0.15s ease;
}
.icon-button:hover {
  background-color: var(--c-bg-hover);
  color: var(--c-text-accent);
}
</style>
