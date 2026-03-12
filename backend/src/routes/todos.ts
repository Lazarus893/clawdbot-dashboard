import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

export const todosRouter = Router();

const CLAWD_DIR = path.join(homedir(), 'clawd');
const MEMORY_DIR = path.join(CLAWD_DIR, 'memory');

interface Todo {
  content: string;
  status: 'in_progress' | 'pending' | 'completed';
  source: string;
}

function extractTodosFromFile(filePath: string): Todo[] {
  const todos: Todo[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    // Extract ## In Progress
    const inProgressMatch = content.match(/## In Progress\s*\n([\s\S]*?)(?=\n## |\n#|$)/);
    if (inProgressMatch) {
      const lines = inProgressMatch[1].split('\n').filter(line => line.trim());
      for (const line of lines) {
        const task = line.replace(/^[-*]\s*/, '').trim();
        if (task && !task.startsWith('#')) {
          todos.push({ content: task, status: 'in_progress', source: fileName });
        }
      }
    }
    
    // Extract ## TODO
    const todoMatch = content.match(/## TODO\s*\n([\s\S]*?)(?=\n## |\n#|$)/);
    if (todoMatch) {
      const lines = todoMatch[1].split('\n').filter(line => line.trim());
      for (const line of lines) {
        const task = line.replace(/^[-*]\s*/, '').replace(/^\[\s*\]/, '').trim();
        if (task && !task.startsWith('#')) {
          todos.push({ content: task, status: 'pending', source: fileName });
        }
      }
    }
    
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  
  return todos;
}

todosRouter.get('/', async (_req, res) => {
  try {
    const todos: Todo[] = [];
    
    // Check if memory directory exists
    if (fs.existsSync(MEMORY_DIR)) {
      // Read from today's memory file
      const today = new Date().toISOString().split('T')[0];
      const todayFile = path.join(MEMORY_DIR, `${today}.md`);
      
      if (fs.existsSync(todayFile)) {
        todos.push(...extractTodosFromFile(todayFile));
      }
      
      // Also check for gateway disconnection file if it exists
      const gatewayFile = path.join(MEMORY_DIR, `${today}-gateway-disconnection.md`);
      if (fs.existsSync(gatewayFile)) {
        todos.push(...extractTodosFromFile(gatewayFile));
      }
    }
    
    res.json({ todos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});
