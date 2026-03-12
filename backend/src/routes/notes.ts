import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

export const notesRouter = Router();

const CLAWD_DIR = path.join(homedir(), 'clawd');

// Password protection
const CORRECT_PASSWORD = '887443';

// In-memory password session (simple approach)
let authenticatedSessions = new Set<string>();

notesRouter.post('/verify-password', (req, res) => {
  const { password, sessionId } = req.body;
  
  if (password === CORRECT_PASSWORD) {
    if (sessionId) {
      authenticatedSessions.add(sessionId);
    }
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

notesRouter.get('/agents', (req, res) => {
  try {
    const agentsPath = path.join(CLAWD_DIR, 'AGENTS.md');
    
    if (!fs.existsSync(agentsPath)) {
      return res.status(404).json({ error: 'AGENTS.md not found' });
    }
    
    const content = fs.readFileSync(agentsPath, 'utf-8');
    res.json({ content, name: 'AGENTS.md' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read AGENTS.md' });
  }
});

notesRouter.get('/memory', (req, res) => {
  try {
    const { sessionId } = req.query;
    
    // Check authentication
    if (sessionId && typeof sessionId === 'string' && authenticatedSessions.has(sessionId)) {
      const memoryPath = path.join(CLAWD_DIR, 'MEMORY.md');
      
      if (!fs.existsSync(memoryPath)) {
        return res.status(404).json({ error: 'MEMORY.md not found' });
      }
      
      const content = fs.readFileSync(memoryPath, 'utf-8');
      return res.json({ content, name: 'MEMORY.md' });
    }
    
    // Return protected response
    res.json({ 
      protected: true, 
      name: 'MEMORY.md',
      message: 'Password required to view this file'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read MEMORY.md' });
  }
});
