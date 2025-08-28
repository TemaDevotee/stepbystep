const fs = require('fs');
const path = require('path');

// Database operations
const dbPath = path.join(__dirname, 'db.json');
const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Mock API handlers
const mockHandlers = {
  // ACCOUNT
  'GET /api/account': (req, res) => {
    res.json(readDb().account);
  },

  'PATCH /api/account/team/:memberId': (req, res) => {
    const db = readDb();
    const memberId = parseInt(req.params.memberId);
    const { role } = req.body;
    const memberIndex = db.account.team.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return res.status(404).send();
    db.account.team[memberIndex].role = role;
    writeDb(db);
    res.json(db.account.team[memberIndex]);
  },

  'POST /api/account/team': (req, res) => {
    const db = readDb();
    const { name, email, role } = req.body;
    const newMember = {
      id: Date.now(),
      name,
      email,
      role: role || 'Operator',
      status: 'invited'
    };
    db.account.team.push(newMember);
    writeDb(db);
    res.status(201).json(newMember);
  },

  'DELETE /api/account/team/:memberId': (req, res) => {
    const db = readDb();
    const memberId = parseInt(req.params.memberId);
    db.account.team = db.account.team.filter(m => m.id !== memberId);
    writeDb(db);
    res.status(200).send();
  },

  'DELETE /api/account': (req, res) => {
    const db = readDb();
    db.account = { name: '', email: '', plan: '', team: [] };
    writeDb(db);
    res.status(200).send();
  },

  // AGENTS
  'GET /api/agents': (req, res) => {
    res.json(readDb().agents);
  },

  'POST /api/agents': (req, res) => {
    const db = readDb();
    const newAgent = { id: Date.now(), isPublished: false, ...req.body };
    db.agents.push(newAgent);
    writeDb(db);
    res.status(201).json(newAgent);
  },

  'GET /api/agents/:id': (req, res) => {
    const agent = readDb().agents.find(a => a.id == req.params.id);
    if (agent) res.json(agent);
    else res.status(404).send();
  },

  'PATCH /api/agents/:id': (req, res) => {
    const db = readDb();
    const i = db.agents.findIndex(a => a.id == req.params.id);
    if (i !== -1) {
      db.agents[i] = { ...db.agents[i], ...req.body };
      writeDb(db);
      res.json(db.agents[i]);
    } else {
      res.status(404).send();
    }
  },

  'DELETE /api/agents/:id': (req, res) => {
    const db = readDb();
    db.agents = db.agents.filter(a => a.id != req.params.id);
    writeDb(db);
    res.status(200).send();
  },

  // CHATS
  'GET /api/chats': (req, res) => {
    res.json(readDb().chats);
  },

  'GET /api/chats/:id': (req, res) => {
    res.json(readDb().chatDetails[req.params.id]);
  },

  'POST /api/chats/:id/messages': (req, res) => {
    const db = readDb();
    const chatId = req.params.id;
    const { sender, text, time } = req.body;
    if (!db.chatDetails[chatId]) {
      return res.status(404).send();
    }
    const message = { sender, text, time: time || new Date().toLocaleTimeString() };
    db.chatDetails[chatId].messages.push(message);
    // Update the summary list lastMessage and time
    const chatIndex = db.chats.findIndex(c => c.id == chatId);
    if (chatIndex !== -1) {
      db.chats[chatIndex].lastMessage = text;
      db.chats[chatIndex].time = 'now';
    }
    writeDb(db);
    res.status(201).json(message);
  },

  'POST /api/chats/:id/interfere': (req, res) => {
    const db = readDb();
    const chatId = req.params.id;
    if (!db.chatDetails[chatId]) return res.status(404).send();
    db.chatDetails[chatId].messages.push({ sender: 'system', text: 'Operator joined the conversation.', time: new Date().toLocaleTimeString() });
    const chatIndex = db.chats.findIndex(c => c.id == chatId);
    if (chatIndex !== -1) db.chats[chatIndex].status = 'live';
    writeDb(db);
    res.status(200).json({ status: 'live' });
  },

  'POST /api/chats/:id/resolve': (req, res) => {
    const db = readDb();
    const chatId = req.params.id;
    if (!db.chatDetails[chatId]) return res.status(404).send();
    db.chatDetails[chatId].messages.push({ sender: 'system', text: 'The issue has been resolved.', time: new Date().toLocaleTimeString() });
    const chatIndex = db.chats.findIndex(c => c.id == chatId);
    if (chatIndex !== -1) db.chats[chatIndex].status = 'resolved';
    writeDb(db);
    res.status(200).json({ status: 'resolved' });
  },

  'POST /api/chats/:id/end': (req, res) => {
    const db = readDb();
    const chatId = req.params.id;
    if (!db.chatDetails[chatId]) return res.status(404).send();
    db.chatDetails[chatId].messages.push({ sender: 'system', text: 'Chat ended by operator.', time: new Date().toLocaleTimeString() });
    const chatIndex = db.chats.findIndex(c => c.id == chatId);
    if (chatIndex !== -1) db.chats[chatIndex].status = 'ended';
    writeDb(db);
    res.status(200).json({ status: 'ended' });
  },

  // KNOWLEDGE GROUPS
  'GET /api/knowledge_groups': (req, res) => {
    const db = readDb();
    const groupsWithCount = db.knowledgeGroups.map(g => ({ ...g, fileCount: g.files.length }));
    res.json(groupsWithCount);
  },

  'POST /api/knowledge_groups': (req, res) => {
    const db = readDb();
    const newGroup = { id: Date.now(), files: [], ...req.body };
    db.knowledgeGroups.push(newGroup);
    writeDb(db);
    res.status(201).json(newGroup);
  },

  'DELETE /api/knowledge_groups/:id': (req, res) => {
    const db = readDb();
    db.knowledgeGroups = db.knowledgeGroups.filter(g => g.id != req.params.id);
    writeDb(db);
    res.status(200).send();
  },

  'GET /api/knowledge_groups/:id': (req, res) => {
    const group = readDb().knowledgeGroups.find(g => g.id == req.params.id);
    if (group) res.json(group);
    else res.status(404).send();
  },

  'POST /api/knowledge_groups/:id/files': (req, res) => {
    const db = readDb();
    const groupIndex = db.knowledgeGroups.findIndex(g => g.id == req.params.id);
    if (groupIndex !== -1) {
      const newFile = { id: Date.now(), ...req.body };
      db.knowledgeGroups[groupIndex].files.push(newFile);
      writeDb(db);
      res.status(201).json(newFile);
    } else {
      res.status(404).send();
    }
  },

  'DELETE /api/knowledge_groups/:groupId/files/:fileId': (req, res) => {
    const db = readDb();
    const groupIndex = db.knowledgeGroups.findIndex(g => g.id == req.params.groupId);
    if (groupIndex !== -1) {
      db.knowledgeGroups[groupIndex].files = db.knowledgeGroups[groupIndex].files.filter(f => f.id != req.params.fileId);
      writeDb(db);
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  },

  // MODELS
  'GET /api/llm_models': (req, res) => {
    res.json(readDb().llm_models);
  }
};

module.exports = { mockHandlers, readDb, writeDb };