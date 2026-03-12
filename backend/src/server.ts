import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { sessionsRouter } from './routes/sessions.js';
import { cronRouter } from './routes/cron.js';
import { systemRouter } from './routes/system.js';
import { agentsRouter } from './routes/agents.js';
import { modelsRouter } from './routes/models.js';
import { todosRouter } from './routes/todos.js';
import { skillsRouter } from './routes/skills.js';
import { notesRouter } from './routes/notes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const CORS_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || CORS_ORIGINS.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// --- Log broadcast infrastructure ---
interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  timestamp: number;
}

const LOG_BUFFER_SIZE = 200;
const logBuffer: LogEntry[] = [];
let logIdCounter = 0;

function createLogEntry(level: LogEntry['level'], message: string, source: string): LogEntry {
  const entry: LogEntry = {
    id: `log-${++logIdCounter}`,
    level,
    message,
    source,
    timestamp: Date.now(),
  };
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) logBuffer.shift();
  return entry;
}

function broadcastLog(entry: LogEntry) {
  const payload = JSON.stringify({ type: 'log', data: entry });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function emitLog(level: LogEntry['level'], message: string, source: string) {
  const entry = createLogEntry(level, message, source);
  broadcastLog(entry);
}

// Request logging — now emits real logs
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level: LogEntry['level'] = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    emitLog(level, `${req.method} ${req.path} ${res.statusCode} ${duration}ms`, 'api');
  });
  next();
});

// Routes
app.use('/api/sessions', sessionsRouter);
app.use('/api/cron', cronRouter);
app.use('/api/system', systemRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/models', modelsRouter);
app.use('/api/todos', todosRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/notes', notesRouter);

// Recent logs endpoint (initial batch for new connections)
app.get('/api/logs/recent', (_req, res) => {
  res.json({ logs: logBuffer });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- HTTP + WebSocket server ---
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/logs' });

wss.on('connection', (ws) => {
  emitLog('info', `WebSocket client connected (total: ${wss.clients.size})`, 'websocket');

  ws.on('close', () => {
    emitLog('debug', `WebSocket client disconnected (total: ${wss.clients.size})`, 'websocket');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Clawdbot Dashboard API running on http://localhost:${PORT}`);
  emitLog('info', `Server started on port ${PORT}`, 'server');
});
