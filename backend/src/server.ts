import express from 'express';
import cors from 'cors';
import { sessionsRouter } from './routes/sessions.js';
import { cronRouter } from './routes/cron.js';
import { systemRouter } from './routes/system.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sessions', sessionsRouter);
app.use('/api/cron', cronRouter);
app.use('/api/system', systemRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Clawdbot Dashboard API running on http://localhost:${PORT}`);
});
