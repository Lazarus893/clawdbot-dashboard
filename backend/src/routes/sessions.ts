import { Router } from 'express';
import { openclawClient } from '../openclaw-client.js';

export const sessionsRouter = Router();

sessionsRouter.get('/list', async (req, res) => {
  try {
    const sessions = await openclawClient.listSessions();
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

sessionsRouter.get('/messages/:sessionKey(*)', async (req, res) => {
  try {
    const messages = await openclawClient.getSessionMessages(req.params.sessionKey);
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session messages' });
  }
});
