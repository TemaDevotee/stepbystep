import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database operations (ES modules version)
const dbPath = path.join(__dirname, 'mock_backend', 'db.json');
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

// Simple route matching with parameter extraction
function matchRoute(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  if (patternParts.length !== pathParts.length) {
    return null;
  }
  
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    
    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }
  
  return params;
}

// Vite plugin for mock API
export function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        const method = req.method;
        const url = req.url;
        
        console.log(`Mock API: ${method} ${url}`);
        
        // Parse request body for POST/PATCH requests
        if (['POST', 'PATCH', 'PUT'].includes(method)) {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch (e) {
              req.body = {};
            }
            processRequest();
          });
        } else {
          processRequest();
        }
        
        function processRequest() {
          // Find matching route
          const path = url.split('?')[0]; // Remove query params
          const routeKey = `${method} /api${path}`;
          let handler = mockHandlers[routeKey];
          let params = {};
          
          if (!handler) {
            // Try pattern matching for parameterized routes
            for (const pattern in mockHandlers) {
              const [patternMethod, patternPath] = pattern.split(' ');
              if (patternMethod === method) {
                const matchedParams = matchRoute(patternPath, `/api${path}`);
                if (matchedParams) {
                  handler = mockHandlers[pattern];
                  params = matchedParams;
                  break;
                }
              }
            }
          }
          
          if (handler) {
            console.log(`Mock API: Found handler for ${method} ${path}`);
            
            // Add params to req object
            req.params = params;
            
            // Add JSON response helper
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
              res.end(JSON.stringify(data));
            };
            
            // Add status helper
            const originalStatus = res.status;
            res.status = (code) => {
              res.statusCode = code;
              return {
                send: () => res.end(),
                json: (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify(data));
                }
              };
            };
            
            try {
              handler(req, res);
            } catch (error) {
              console.error('Mock API error:', error);
              res.statusCode = 500;
              res.json({ error: 'Internal server error' });
            }
          } else {
            console.log(`Mock API: No handler found for ${method} ${path}, passing to next middleware`);
            // Not a mock API route, continue to next middleware
            next();
          }
        }
      });
    }
  };
}

export default mockApiPlugin;