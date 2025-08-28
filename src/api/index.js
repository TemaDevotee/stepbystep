/*
 * A tiny in‑browser API layer that emulates a backend using
 * LocalStorage.  The rest of the application expects to call
 * axios‑like methods (get/post/patch/delete) against REST endpoints
 * such as `/agents`, `/chats/:id`, etc.  Instead of making HTTP
 * requests this module parses the path, reads from a local database
 * stored in localStorage and performs the requested CRUD action.
 *
 * On first load the module seeds LocalStorage with a copy of the
 * initial dataset defined below.  Subsequent calls persist any
 * changes back into LocalStorage so that edits survive page reloads.
 */

// The key used to stash the database in localStorage
const STORAGE_KEY = 'trickster_db';

/*
 * defaultDb replicates the contents of mock_backend/db.json.  If you
 * need to update the seed data (e.g. to add more chats or agents)
 * modify the object below.  The structure mirrors that of the JSON
 * file: account information, an array of agents, a list of chat
 * summaries, detailed chat transcripts in chatDetails, knowledge
 * groups and a list of large language models.
 */
const defaultDb = {
  account: {
    name: "Tema",
    email: "tema@wsl.ru",
    plan: "Pro Plan",
    team: [
      // The first member is the account owner.  Use the Owner role to prevent editing.
      { id: 1, name: "Tema", email: "tema@wsl.ru", role: "Owner" },
      { id: 2, name: "Alex", email: "alex@example.com", role: "Operator" },
      { id: 3, name: "Sam", email: "sam@example.com", role: "Read-only" }
    ]
  },
  agents: [
    {
      id: 1,
      name: "GuzziBot",
      model: "GPT-4o",
      personality: "Formal",
      knowledgeIds: [10],
      isPublished: true,
      channels: ["web"]
    },
    {
      id: 2,
      name: "ClientSupport",
      model: "Claude 3 Opus",
      personality: "Friendly",
      knowledgeIds: [20],
      isPublished: true,
      channels: ["web"]
    }
  ],
  chats: [
    {
      id: 1,
      clientName: "Alice Johnson",
      lastMessage: "User is reporting an error after multiple attempts.",
      time: "2m ago",
      status: "attention",
      channels: ["web"]
    },
    {
      id: 2,
      clientName: "Frank Miller",
      lastMessage: "I'M STUCK!! HELLO?!?",
      time: "5m ago",
      status: "attention",
      channels: ["telegram"]
    },
    {
      id: 3,
      clientName: "Grace Hopper",
      lastMessage: "This is unacceptable, I want a refund now.",
      time: "10m ago",
      status: "attention",
      channels: ["whatsapp"]
    },
    {
      id: 4,
      clientName: "Oliver Twist",
      lastMessage: "My account is blocked and I can't access my funds!",
      time: "12m ago",
      status: "attention",
      channels: ["web"]
    },
    {
      id: 5,
      clientName: "David Lee",
      lastMessage: "Agent: We ship worldwide. Where are you located?",
      time: "Just now",
      status: "live",
      channels: ["web"]
    },
    {
      id: 6,
      clientName: "Diana Prince",
      lastMessage: "I have another question about my invoice.",
      time: "1m ago",
      status: "live",
      channels: ["telegram"]
    },
    {
      id: 7,
      clientName: "Penelope Cruz",
      lastMessage: "Okay, I'm sending the screenshot now.",
      time: "3m ago",
      status: "live",
      channels: ["whatsapp"]
    },
    {
      id: 8,
      clientName: "Quentin Crisp",
      lastMessage: "So, the new feature... how does it work exactly?",
      time: "7m ago",
      status: "live",
      channels: ["web"]
    },
    {
      id: 9,
      clientName: "Steve Rogers",
      lastMessage: "The dev team is looking into this bug report.",
      time: "25m ago",
      status: "paused",
      channels: ["web"]
    },
    {
      id: 10,
      clientName: "Tony Stark",
      lastMessage: "Our product team is reviewing your feature request.",
      time: "45m ago",
      status: "paused",
      channels: ["telegram"]
    },
    {
      id: 11,
      clientName: "Natasha Romanoff",
      lastMessage: "We are still waiting for an update from the billing department.",
      time: "1h ago",
      status: "paused",
      channels: ["web"]
    },
    {
      id: 12,
      clientName: "Bruce Banner",
      lastMessage: "I've escalated this to our senior engineers.",
      time: "3h ago",
      status: "paused",
      channels: ["whatsapp"]
    },
    {
      id: 13,
      clientName: "Charlie Brown",
      lastMessage: "Just checking in to see if you had a chance to try the steps.",
      time: "5h ago",
      status: "idle",
      channels: ["web"]
    },
    {
      id: 14,
      clientName: "Ivy Green",
      lastMessage: "Let me know when you've sent over the required documents.",
      time: "8h ago",
      status: "idle",
      channels: ["telegram"]
    },
    {
      id: 15,
      clientName: "Jack White",
      lastMessage: "Is there anything else I can help you with today?",
      time: "1d ago",
      status: "idle",
      channels: ["web"]
    },
    {
      id: 16,
      clientName: "Walter White",
      lastMessage: "Did that solution work for you?",
      time: "1d ago",
      status: "idle",
      channels: ["whatsapp"]
    },
    {
      id: 17,
      clientName: "Sophia Rodriguez",
      lastMessage: "Happy I could help! Have a great day.",
      time: "2d ago",
      status: "resolved",
      channels: ["web"]
    },
    {
      id: 18,
      clientName: "Karen Page",
      lastMessage: "Your order has been successfully delivered. Enjoy!",
      time: "2d ago",
      status: "resolved",
      channels: ["telegram"]
    },
    {
      id: 19,
      clientName: "Leo Fitz",
      lastMessage: "Perfect, that fixed it. Thanks so much!",
      time: "3d ago",
      status: "resolved",
      channels: ["web"]
    },
    {
      id: 20,
      clientName: "Bruce Wayne",
      lastMessage: "The payment has gone through. Closing this ticket now.",
      time: "4d ago",
      status: "resolved",
      channels: ["whatsapp"]
    }
  ],
  chatDetails: {
    1: {
      id: 1,
      clientName: "Alice Johnson",
      channels: ["web"],
      messages: [
        { sender: "bot", text: "Hello! How can I assist you today?", time: "10:00 AM" },
        { sender: "client", text: "I'm having an issue with my account. I can't access it.", time: "10:01 AM" },
        { sender: "system", text: "Negative sentiment detected. Operator notified." }
      ]
    },
    2: {
      id: 2,
      clientName: "Frank Miller",
      channels: ["telegram"],
      messages: [
        { sender: "bot", text: "Hi! What can I do for you?", time: "9:45 AM" },
        { sender: "client", text: "I'M STUCK!! HELLO?!?", time: "9:46 AM" }
      ]
    },
    3: {
      id: 3,
      clientName: "Grace Hopper",
      channels: ["whatsapp"],
      messages: [
        { sender: "bot", text: "Welcome to support. How can I help?", time: "11:05 AM" },
        { sender: "client", text: "My order arrived damaged. This is unacceptable, I want a refund now.", time: "11:06 AM" }
      ]
    },
    4: {
      id: 4,
      clientName: "Oliver Twist",
      channels: ["web"],
      messages: [
        { sender: "client", text: "My account is blocked and I can't access my funds!", time: "1:15 PM" }
      ]
    },
    5: {
      id: 5,
      clientName: "David Lee",
      channels: ["web"],
      messages: [
        { sender: "client", text: "Do you ship to Australia?", time: "3:30 PM" },
        { sender: "bot", text: "Agent: We ship worldwide. Where are you located?", time: "3:31 PM" }
      ]
    },
    6: {
      id: 6,
      clientName: "Diana Prince",
      channels: ["telegram"],
      messages: [
        { sender: "bot", text: "Is there anything else I can assist you with?", time: "4:00 PM" },
        { sender: "client", text: "Yes, I have another question about my invoice.", time: "4:01 PM" }
      ]
    },
    7: {
      id: 7,
      clientName: "Penelope Cruz",
      channels: ["whatsapp"],
      messages: [
        { sender: "operator", text: "Could you please provide a screenshot of the error message?", time: "4:15 PM" },
        { sender: "client", text: "Okay, I'm sending the screenshot now.", time: "4:16 PM" }
      ]
    },
    8: {
      id: 8,
      clientName: "Quentin Crisp",
      channels: ["web"],
      messages: [
        { sender: "client", text: "So, the new feature... how does it work exactly?", time: "4:30 PM" }
      ]
    },
    9: {
      id: 9,
      clientName: "Steve Rogers",
      channels: ["web"],
      messages: [
        { sender: "client", text: "I think I found a bug in your payment form.", time: "5:00 PM" },
        { sender: "operator", text: "Thank you for the report. The dev team is looking into this bug report.", time: "5:05 PM" }
      ]
    },
    10: {
      id: 10,
      clientName: "Tony Stark",
      channels: ["telegram"],
      messages: [
        { sender: "client", text: "It would be great if you could add an integration with Figma.", time: "5:20 PM" },
        { sender: "operator", text: "That's an excellent idea. Our product team is reviewing your feature request.", time: "5:22 PM" }
      ]
    },
    11: {
      id: 11,
      clientName: "Natasha Romanoff",
      channels: ["web"],
      messages: [
        { sender: "client", text: "I was charged twice for my last subscription renewal.", time: "5:40 PM" },
        { sender: "operator", text: "I'm very sorry to hear that. We are still waiting for an update from the billing department.", time: "5:45 PM" }
      ]
    },
    12: {
      id: 12,
      clientName: "Bruce Banner",
      channels: ["whatsapp"],
      messages: [
        { sender: "client", text: "The entire site is down for me!", time: "6:00 PM" },
        { sender: "operator", text: "This is a high‑priority issue. I've escalated this to our senior engineers.", time: "6:01 PM" }
      ]
    },
    13: {
      id: 13,
      clientName: "Charlie Brown",
      channels: ["web"],
      messages: [
        { sender: "operator", text: "I've sent the password reset link to your email.", time: "Yesterday" },
        { sender: "system", text: "24 hours passed. Sending follow‑up." },
        { sender: "bot", text: "Just checking in to see if you had a chance to try the steps.", time: "8:10 AM" }
      ]
    },
    14: {
      id: 14,
      clientName: "Ivy Green",
      channels: ["telegram"],
      messages: [
        { sender: "operator", text: "To process your request, I'll need a copy of your ID.", time: "Yesterday" },
        { sender: "bot", text: "Let me know when you've sent over the required documents.", time: "9:00 AM" }
      ]
    },
    15: {
      id: 15,
      clientName: "Jack White",
      channels: ["web"],
      messages: [
        { sender: "bot", text: "Your issue has been resolved.", time: "1d ago" },
        { sender: "bot", text: "Is there anything else I can help you with today?", time: "1d ago" }
      ]
    },
    16: {
      id: 16,
      clientName: "Walter White",
      channels: ["whatsapp"],
      messages: [
        { sender: "operator", text: "Try clearing your browser cache. That should fix it.", time: "1d ago" },
        { sender: "bot", text: "Did that solution work for you?", time: "10:30 AM" }
      ]
    },
    17: {
      id: 17,
      clientName: "Sophia Rodriguez",
      channels: ["web"],
      messages: [
        { sender: "client", text: "Thank you, it's working now!", time: "2d ago" },
        { sender: "operator", text: "Happy I could help! Have a great day.", time: "2d ago" }
      ]
    },
    18: {
      id: 18,
      clientName: "Karen Page",
      channels: ["telegram"],
      messages: [
        { sender: "bot", text: "Tracking shows your package was delivered at 2:15 PM.", time: "2d ago" },
        { sender: "client", text: "Got it, thank you!", time: "2d ago" },
        { sender: "bot", text: "Your order has been successfully delivered. Enjoy!", time: "2d ago" }
      ]
    },
    19: {
      id: 19,
      clientName: "Leo Fitz",
      channels: ["web"],
      messages: [
        { sender: "operator", text: "Okay, I've manually refreshed your account data.", time: "3d ago" },
        { sender: "client", text: "Perfect, that fixed it. Thanks so much!", time: "3d ago" }
      ]
    },
    20: {
      id: 20,
      clientName: "Bruce Wayne",
      channels: ["whatsapp"],
      messages: [
        { sender: "operator", text: "We've resolved the issue with the payment gateway.", time: "4d ago" },
        { sender: "client", text: "Confirmed, payment is successful.", time: "4d ago" },
        { sender: "operator", text: "The payment has gone through. Closing this ticket now.", time: "4d ago" }
      ]
    }
  },
  knowledgeGroups: [
    {
      id: 10,
      name: "Product Manuals",
      description: "User guides and technical specifications for all products.",
      files: [
        { id: 101, type: "pdf", name: "Pricing_FAQ.pdf", details: "2.1 MB" },
        { id: 102, type: "url", name: "https://docs.trickster.dev", details: "Website sync" }
      ]
    },
    {
      id: 20,
      name: "Internal Policies",
      description: "Company policies and procedures for internal use.",
      files: [
        { id: 201, type: "text", name: "Return Policy", details: "1.5 KB" }
      ]
    },
    {
      id: 30,
      name: "Sales Scripts",
      description: "Scripts and talking points for the sales team.",
      files: []
    }
  ],
  llm_models: [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      description: "The latest and most advanced model.",
      tags: ["Top Choice"]
    },
    {
      id: "claude-3-opus",
      name: "Claude 3 Opus",
      description: "Top-tier performance for long context.",
      tags: []
    }
  ]
};

// Deep clone utility to avoid accidental mutations of defaultDb
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Load the database from localStorage or seed it with default data
function loadDb() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored database, resetting to defaults.', e);
    }
  }
  const fresh = clone(defaultDb);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

// Persist the database back into localStorage
function saveDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// Helpers to parse an endpoint path into segments and strip any /api prefix
function parsePath(url) {
  // Remove any leading origin (e.g. http://localhost:3000)
  const u = url.replace(/^[a-zA-Z]+:\/\/[\w.:]+/, '');
  // Strip optional /api prefix
  const clean = u.replace(/^\/api\//, '/');
  const parts = clean.split('?')[0].split('#')[0].split('/').filter(Boolean);
  return parts;
}

// Generate a simple success response wrapper similar to axios
function success(data) {
  return Promise.resolve({ data });
}

// Simple error helper
function notFound() {
  return Promise.reject(new Error('Not found'));
}

// API implementation
const apiClient = {
  async get(url) {
    const db = loadDb();
    const parts = parsePath(url);
    // GET /account
    if (parts.length === 1 && parts[0] === 'account') {
      return success(clone(db.account));
    }
    // GET /agents
    if (parts.length === 1 && parts[0] === 'agents') {
      return success(clone(db.agents));
    }
    // GET /agents/:id
    if (parts.length === 2 && parts[0] === 'agents') {
      const id = Number(parts[1]);
      const agent = db.agents.find((a) => a.id === id);
      return agent ? success(clone(agent)) : notFound();
    }
    // GET /chats
    if (parts.length === 1 && parts[0] === 'chats') {
      return success(clone(db.chats));
    }
    // GET /chats/:id
    if (parts.length === 2 && parts[0] === 'chats') {
      const id = Number(parts[1]);
      const summary = db.chats.find((c) => c.id === id);
      const detail = db.chatDetails[id];
      if (!detail || !summary) return notFound();
      // Compose the detail with status, lastMessage and time from summary
      const combined = Object.assign({}, clone(detail), {
        status: summary.status,
        lastMessage: summary.lastMessage,
        time: summary.time,
      });
      return success(combined);
    }
    // GET /knowledge_groups
    if (parts.length === 1 && parts[0] === 'knowledge_groups') {
      // Attach fileCount property
      const groupsWithCount = db.knowledgeGroups.map((g) => ({
        ...clone(g),
        fileCount: g.files.length,
      }));
      return success(groupsWithCount);
    }
    // GET /knowledge_groups/:id
    if (parts.length === 2 && parts[0] === 'knowledge_groups') {
      const id = Number(parts[1]);
      const group = db.knowledgeGroups.find((g) => g.id === id);
      return group ? success(clone(group)) : notFound();
    }
    // GET /llm_models
    if (parts.length === 1 && parts[0] === 'llm_models') {
      return success(clone(db.llm_models));
    }
    // Fallback: not found
    return notFound();
  },

  async post(url, payload) {
    const db = loadDb();
    const parts = parsePath(url);
    // POST /agents
    if (parts.length === 1 && parts[0] === 'agents') {
      const newAgent = Object.assign(
        {
          id: Date.now(),
          isPublished: false,
          channels: [],
          knowledgeIds: [],
        },
        payload
      );
      db.agents.push(newAgent);
      saveDb(db);
      return success(clone(newAgent));
    }
    // POST /chats/:id/messages
    if (parts.length === 3 && parts[0] === 'chats' && parts[2] === 'messages') {
      const chatId = Number(parts[1]);
      const detail = db.chatDetails[chatId];
      const summaryIndex = db.chats.findIndex((c) => c.id === chatId);
      if (!detail || summaryIndex === -1) return notFound();
      const { sender, text, time } = payload;
      const message = {
        sender,
        text,
        time: time || new Date().toLocaleTimeString(),
      };
      detail.messages.push(message);
      // Update summary
      db.chats[summaryIndex].lastMessage = text;
      db.chats[summaryIndex].time = 'now';
      saveDb(db);
      return success(clone(message));
    }
    // POST /chats/:id/interfere
    if (parts.length === 3 && parts[0] === 'chats' && parts[2] === 'interfere') {
      const chatId = Number(parts[1]);
      const detail = db.chatDetails[chatId];
      const summary = db.chats.find((c) => c.id === chatId);
      if (!detail || !summary) return notFound();
      detail.messages.push({ sender: 'system', text: 'Operator joined the conversation.', time: new Date().toLocaleTimeString() });
      summary.status = 'live';
      saveDb(db);
      return success({ status: 'live' });
    }
    // POST /chats/:id/resolve
    if (parts.length === 3 && parts[0] === 'chats' && parts[2] === 'resolve') {
      const chatId = Number(parts[1]);
      const detail = db.chatDetails[chatId];
      const summary = db.chats.find((c) => c.id === chatId);
      if (!detail || !summary) return notFound();
      detail.messages.push({ sender: 'system', text: 'The issue has been resolved.', time: new Date().toLocaleTimeString() });
      summary.status = 'resolved';
      saveDb(db);
      return success({ status: 'resolved' });
    }
    // POST /chats/:id/end
    if (parts.length === 3 && parts[0] === 'chats' && parts[2] === 'end') {
      const chatId = Number(parts[1]);
      const detail = db.chatDetails[chatId];
      const summary = db.chats.find((c) => c.id === chatId);
      if (!detail || !summary) return notFound();
      detail.messages.push({ sender: 'system', text: 'Chat ended by operator.', time: new Date().toLocaleTimeString() });
      // The spec groups closed chats under "Idle" rather than a separate
      // "Ended" state.  Update the summary status to idle to match the
      // UI grouping and hide it from the active/live groups.
      summary.status = 'idle';
      saveDb(db);
      return success({ status: 'idle' });
    }
    // POST /knowledge_groups
    if (parts.length === 1 && parts[0] === 'knowledge_groups') {
      const newGroup = Object.assign({ id: Date.now(), files: [] }, payload);
      db.knowledgeGroups.push(newGroup);
      saveDb(db);
      return success(clone(newGroup));
    }
    // POST /knowledge_groups/:id/files
    if (parts.length === 3 && parts[0] === 'knowledge_groups' && parts[2] === 'files') {
      const groupId = Number(parts[1]);
      const group = db.knowledgeGroups.find((g) => g.id === groupId);
      if (!group) return notFound();
      const newFile = Object.assign({ id: Date.now() }, payload);
      group.files.push(newFile);
      saveDb(db);
      return success(clone(newFile));
    }
    // POST /account/team
    if (parts.length === 2 && parts[0] === 'account' && parts[1] === 'team') {
      const { name, email, role, status } = payload;
      const newMember = {
        id: Date.now(),
        name,
        email,
        role: role || 'Operator',
        // New invitations default to the 'invited' status so that the UI
        // can display a pending state.  If a status is explicitly provided
        // use it instead (e.g. when seeding existing team members).
        status: status || 'invited'
      };
      db.account.team.push(newMember);
      saveDb(db);
      return success(clone(newMember));
    }
    // Fallback
    return notFound();
  },

  async patch(url, payload) {
    const db = loadDb();
    const parts = parsePath(url);
    // PATCH /agents/:id
    if (parts.length === 2 && parts[0] === 'agents') {
      const id = Number(parts[1]);
      const index = db.agents.findIndex((a) => a.id === id);
      if (index === -1) return notFound();
      db.agents[index] = Object.assign({}, db.agents[index], payload);
      saveDb(db);
      return success(clone(db.agents[index]));
    }
    // PATCH /account/team/:memberId
    if (parts.length === 3 && parts[0] === 'account' && parts[1] === 'team') {
      const memberId = Number(parts[2]);
      const index = db.account.team.findIndex((m) => m.id === memberId);
      if (index === -1) return notFound();
      const current = db.account.team[index];
      // Prevent changing the Owner's role.  If the member is the owner
      // and the payload attempts to modify the role, ignore that change.
      if (current.role === 'Owner' && payload.role && payload.role !== 'Owner') {
        return success(clone(current));
      }
      db.account.team[index] = Object.assign({}, current, payload);
      saveDb(db);
      return success(clone(db.account.team[index]));
    }
    return notFound();
  },

  async delete(url) {
    const db = loadDb();
    const parts = parsePath(url);
    // DELETE /agents/:id
    if (parts.length === 2 && parts[0] === 'agents') {
      const id = Number(parts[1]);
      db.agents = db.agents.filter((a) => a.id !== id);
      saveDb(db);
      return success(null);
    }
    // DELETE /knowledge_groups/:id
    if (parts.length === 2 && parts[0] === 'knowledge_groups') {
      const id = Number(parts[1]);
      db.knowledgeGroups = db.knowledgeGroups.filter((g) => g.id !== id);
      saveDb(db);
      return success(null);
    }
    // DELETE /knowledge_groups/:groupId/files/:fileId
    if (parts.length === 4 && parts[0] === 'knowledge_groups' && parts[2] === 'files') {
      const groupId = Number(parts[1]);
      const fileId = Number(parts[3]);
      const group = db.knowledgeGroups.find((g) => g.id === groupId);
      if (!group) return notFound();
      group.files = group.files.filter((f) => f.id !== fileId);
      saveDb(db);
      return success(null);
    }
    // DELETE /account
    if (parts.length === 1 && parts[0] === 'account') {
      db.account = { name: '', email: '', plan: '', team: [] };
      saveDb(db);
      return success(null);
    }
    return notFound();
  },
};

export default apiClient;
