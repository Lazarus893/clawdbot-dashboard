import { Router } from 'express';
import { clawdbotClient } from '../clawdbot-client.js';

export const sessionsRouter = Router();

sessionsRouter.get('/list', async (req, res) => {
  try {
    const sessions = await clawdbotClient.listSessions();
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});
