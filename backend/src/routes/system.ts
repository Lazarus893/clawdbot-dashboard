import { Router } from 'express';
import { clawdbotClient } from '../clawdbot-client.js';

export const systemRouter = Router();

systemRouter.get('/status', async (req, res) => {
  try {
    const status = await clawdbotClient.getSystemStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});
