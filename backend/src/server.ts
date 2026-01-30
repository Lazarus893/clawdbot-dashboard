import express from 'express';
import cors from 'cors';
import { sessionsRouter } from './routes/sessions.js';
import { cronRouter } from './routes/cron.js';
import { systemRouter } from './routes/system.js';
import { agentsRouter } from './routes/agents.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/sessions', sessionsRouter);
app.use('/api/cron', cronRouter);
app.use('/api/system', systemRouter);
app.use('/api/agents', agentsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Clawdbot Dashboard API running on http://localhost:${PORT}`);
});
