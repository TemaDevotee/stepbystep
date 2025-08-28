const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const dbPath = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json());

const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// --- API ROUTES ---

// ACCOUNT
app.get('/api/account', (req, res) => res.json(readDb().account));

// Update a team member's role
app.patch('/api/account/team/:memberId', (req, res) => {
    const db = readDb();
    const memberId = parseInt(req.params.memberId);
    const { role } = req.body;
    const memberIndex = db.account.team.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return res.status(404).send();
    db.account.team[memberIndex].role = role;
    writeDb(db);
    res.json(db.account.team[memberIndex]);
});

// Invite a new team member
app.post('/api/account/team', (req, res) => {
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
});

// Remove a team member (e.g. cancel an invitation)
app.delete('/api/account/team/:memberId', (req, res) => {
    const db = readDb();
    const memberId = parseInt(req.params.memberId);
    db.account.team = db.account.team.filter(m => m.id !== memberId);
    writeDb(db);
    res.status(200).send();
});

// Delete entire account (dangerous zone). Clears account and related data.
app.delete('/api/account', (req, res) => {
    const db = readDb();
    db.account = { name: '', email: '', plan: '', team: [] };
    writeDb(db);
    res.status(200).send();
});

// AGENTS
app.get('/api/agents', (req, res) => res.json(readDb().agents));
app.post('/api/agents', (req, res) => { const db = readDb(); const newAgent = { id: Date.now(), isPublished: false, ...req.body }; db.agents.push(newAgent); writeDb(db); res.status(201).json(newAgent); });
app.get('/api/agents/:id', (req, res) => { const agent = readDb().agents.find(a => a.id == req.params.id); if (agent) res.json(agent); else res.status(404).send(); });
app.patch('/api/agents/:id', (req, res) => { const db = readDb(); const i = db.agents.findIndex(a => a.id == req.params.id); if (i !== -1) { db.agents[i] = { ...db.agents[i], ...req.body }; writeDb(db); res.json(db.agents[i]); } else res.status(404).send(); });
app.delete('/api/agents/:id', (req, res) => { const db = readDb(); db.agents = db.agents.filter(a => a.id != req.params.id); writeDb(db); res.status(200).send(); });

// CHATS
app.get('/api/chats', (req, res) => res.json(readDb().chats));
app.get('/api/chats/:id', (req, res) => res.json(readDb().chatDetails[req.params.id]));

// Append a new message to a chat conversation. Expects body with { sender, text, time }
app.post('/api/chats/:id/messages', (req, res) => {
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
});

// Operator interferes: sets status to live and sends system message
app.post('/api/chats/:id/interfere', (req, res) => {
    const db = readDb();
    const chatId = req.params.id;
    if (!db.chatDetails[chatId]) return res.status(404).send();
    db.chatDetails[chatId].messages.push({ sender: 'system', text: 'Operator joined the conversation.', time: new Date().toLocaleTimeString() });
    const chatIndex = db.chats.findIndex(c => c.id == chatId);
    if (chatIndex !== -1) db.chats[chatIndex].status = 'live';
    writeDb(db);
    res.status(200).json({ status: 'live' });
});

// Resolve the issue: sets status to resolved and adds a system message
app.post('/api/chats/:id/resolve', (req, res) => {
    const db = readDb();
    const chatId = req.params.id;
    if (!db.chatDetails[chatId]) return res.status(404).send();
    db.chatDetails[chatId].messages.push({ sender: 'system', text: 'The issue has been resolved.', time: new Date().toLocaleTimeString() });
    const chatIndex = db.chats.findIndex(c => c.id == chatId);
    if (chatIndex !== -1) db.chats[chatIndex].status = 'resolved';
    writeDb(db);
    res.status(200).json({ status: 'resolved' });
});

// End the chat: sets status to ended and adds a goodbye message
app.post('/api/chats/:id/end', (req, res) => {
    const db = readDb();
    const chatId = req.params.id;
    if (!db.chatDetails[chatId]) return res.status(404).send();
    db.chatDetails[chatId].messages.push({ sender: 'system', text: 'Chat ended by operator.', time: new Date().toLocaleTimeString() });
    const chatIndex = db.chats.findIndex(c => c.id == chatId);
    if (chatIndex !== -1) db.chats[chatIndex].status = 'ended';
    writeDb(db);
    res.status(200).json({ status: 'ended' });
});

// KNOWLEDGE GROUPS
app.get('/api/knowledge_groups', (req, res) => {
    const db = readDb();
    const groupsWithCount = db.knowledgeGroups.map(g => ({ ...g, fileCount: g.files.length }));
    res.json(groupsWithCount);
});
app.post('/api/knowledge_groups', (req, res) => { const db = readDb(); const newGroup = { id: Date.now(), files: [], ...req.body }; db.knowledgeGroups.push(newGroup); writeDb(db); res.status(201).json(newGroup); });
app.delete('/api/knowledge_groups/:id', (req, res) => { const db = readDb(); db.knowledgeGroups = db.knowledgeGroups.filter(g => g.id != req.params.id); writeDb(db); res.status(200).send(); });
app.get('/api/knowledge_groups/:id', (req, res) => {
    const group = readDb().knowledgeGroups.find(g => g.id == req.params.id);
    if (group) res.json(group); else res.status(404).send();
});

// Files in knowledge groups
app.post('/api/knowledge_groups/:id/files', (req, res) => {
    const db = readDb();
    const groupIndex = db.knowledgeGroups.findIndex(g => g.id == req.params.id);
    if (groupIndex !== -1) {
        const newFile = { id: Date.now(), ...req.body };
        db.knowledgeGroups[groupIndex].files.push(newFile);
        writeDb(db);
        res.status(201).json(newFile);
    } else res.status(404).send();
});
app.delete('/api/knowledge_groups/:groupId/files/:fileId', (req, res) => {
    const db = readDb();
    const groupIndex = db.knowledgeGroups.findIndex(g => g.id == req.params.groupId);
    if (groupIndex !== -1) {
        db.knowledgeGroups[groupIndex].files = db.knowledgeGroups[groupIndex].files.filter(f => f.id != req.params.fileId);
        writeDb(db);
        res.status(200).send();
    } else res.status(404).send();
});

// MODELS
app.get('/api/llm_models', (req, res) => res.json(readDb().llm_models));

app.listen(PORT, () => console.log(`Mock API server is running on http://localhost:${PORT}`));
